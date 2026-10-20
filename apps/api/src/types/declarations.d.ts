// Fallback type declarations for build resilience
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}

declare module 'mongodb-memory-server' {
  export class MongoMemoryServer {
    static create(opts?: any): Promise<MongoMemoryServer>;
    getUri(): string;
    stop(): Promise<boolean>;
  }
}
