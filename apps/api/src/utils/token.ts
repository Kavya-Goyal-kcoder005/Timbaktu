import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  const isProd = config.nodeEnv === 'production';
  res.cookie('timbaktu_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  const isProd = config.nodeEnv === 'production';
  res.cookie('timbaktu_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
}
