import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';

let mongoServer: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Timbaktu End-to-End API Integration Suite', () => {
  let user1Token: string;
  let user2Token: string;
  let user1PostId: string;
  let user1PostSlug: string;

  // 1. AUTHENTICATION TESTS
  describe('Authentication & User Sessions', () => {
    it('registers user 1 successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          displayName: 'Kavya Goyal',
          username: 'kavya',
          email: 'kavya@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('kavya');
      expect(res.body.data).not.toHaveProperty('passwordHash');
      expect(res.body).toHaveProperty('token');
      user1Token = res.body.token;
    });

    it('prevents registering duplicate username or email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          displayName: 'Duplicate User',
          username: 'kavya',
          email: 'other@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USERNAME_TAKEN');
    });

    it('registers user 2 successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          displayName: 'Second Storyteller',
          username: 'storyteller2',
          email: 'user2@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect(res.status).toBe(201);
      user2Token = res.body.token;
    });

    it('logs in with valid username and password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'kavya',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe('Kavya Goyal');
    });

    it('rejects login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'kavya',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('fetches current user profile with auth token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('kavya');
    });

    it('rejects /auth/me without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  // 2. CONTENT MANAGEMENT & OWNERSHIP TESTS
  describe('Posts CRUD and Server-Side Ownership Enforcement', () => {
    it('creates a new post as user 1', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'The Song of Timbaktu Woods',
          excerpt: 'A quiet morning deep in the woodland.',
          contentHtml: '<p>The cuckoo bird sang from the oak tree branch.</p><script>alert("hacked")</script>',
          tags: ['woodland', 'stories'],
          status: 'published',
          visibility: 'public',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toContain('the-song-of-timbaktu-woods');
      // Verify HTML Sanitization: <script> should be stripped out!
      expect(res.body.data.contentHtml).not.toContain('<script>');
      expect(res.body.data.readingTimeMinutes).toBeGreaterThanOrEqual(1);

      user1PostId = res.body.data.id;
      user1PostSlug = res.body.data.slug;
    });

    it('uploads narration audio and creates a story with audio attached', async () => {
      const audioBuffer = Buffer.from('fake webm audio binary chunk for testing');
      const uploadRes = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${user1Token}`)
        .attach('file', audioBuffer, { filename: 'narration.webm', contentType: 'audio/webm' })
        .field('durationSeconds', '14');

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.data.mediaType).toBe('audio');
      expect(uploadRes.body.data.url).toContain('/api/v1/media/stream/');

      const postRes = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'The Talking River of Timbaktu',
          excerpt: 'Listen to the soothing river sounds.',
          contentHtml: '<p>The river talked to the stones as it flowed peacefully through the woods.</p>',
          audio: uploadRes.body.data,
          tags: ['nature', 'stories'],
          status: 'published',
          visibility: 'public',
        });

      expect(postRes.status).toBe(201);
      expect(postRes.body.success).toBe(true);
      expect(postRes.body.data.audio).toBeDefined();
      expect(postRes.body.data.audio.url).toContain('/api/v1/media/stream/');
      expect(postRes.body.data.audio.durationSeconds).toBe(14);
    });

    it('retrieves published post by slug', async () => {
      const res = await request(app).get(`/api/v1/posts/${user1PostSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('The Song of Timbaktu Woods');
      expect(res.body.data.author.username).toBe('kavya');
    });

    it('lists published posts in public feed', async () => {
      const res = await request(app).get('/api/v1/posts');
      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('filters posts by tag', async () => {
      const res = await request(app).get('/api/v1/posts?tag=woodland');
      expect(res.status).toBe(200);
      expect(res.body.data.items[0].tags).toContain('woodland');
    });

    it('searches posts by keyword', async () => {
      const res = await request(app).get('/api/v1/search?q=woodland');
      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    // CRITICAL OWNERSHIP TEST: User 2 CANNOT edit User 1's post!
    it('STRICT SECURITY: rejects user 2 attempting to edit user 1 post', async () => {
      const res = await request(app)
        .patch(`/api/v1/posts/${user1PostId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'Malicious Overwrite Attempt',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    // CRITICAL OWNERSHIP TEST: User 2 CANNOT delete User 1's post!
    it('STRICT SECURITY: rejects user 2 attempting to delete user 1 post', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${user1PostId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows author (user 1) to update their own post', async () => {
      const res = await request(app)
        .patch(`/api/v1/posts/${user1PostId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'The Song of Timbaktu Woods (Updated)',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('The Song of Timbaktu Woods (Updated)');
    });
  });

  // 3. EXPORTS & REPORTING
  describe('Post Exports and Moderation', () => {
    it('exports post as Markdown', async () => {
      const res = await request(app).get(`/api/v1/posts/${user1PostId}/export?format=md`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/markdown');
      expect(res.text).toContain('# The Song of Timbaktu Woods');
    });

    it('exports post as HTML', async () => {
      const res = await request(app).get(`/api/v1/posts/${user1PostId}/export?format=html`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain('TIMBAKTU');
    });

    it('exports post as PDF', async () => {
      const res = await request(app).get(`/api/v1/posts/${user1PostId}/export?format=pdf`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('submits a content moderation report', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${user1PostId}/report`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          reason: 'spam',
          details: 'Testing report functionality',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
