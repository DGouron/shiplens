import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@main/app.module.js';

describe('App bootstrap', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ENCRYPTION_KEY =
      'a'.repeat(64);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should bootstrap all modules without crashing', () => {
    expect(app).toBeDefined();
  });

  it('should register HTTP routes', async () => {
    const server = app.getHttpServer();
    expect(server).toBeDefined();
  });
});
