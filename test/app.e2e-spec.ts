import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import * as express from 'express';

describe('Justify API (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable text/plain body parsing
    app.use(express.text({ type: 'text/plain' }));
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/token (POST)', () => {
    it('should generate a token with valid email', () => {
      return request(app.getHttpServer())
        .post('/api/token')
        .send({ email: 'test@example.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.token).toMatch(/^Bearer /);
          authToken = res.body.token;
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/token')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('/api/justify (POST)', () => {
    beforeAll(async () => {
      // Get a fresh token for justify tests
      const response = await request(app.getHttpServer())
        .post('/api/token')
        .send({ email: 'justify-test@example.com' });
      authToken = response.body.token;
    });

    it('should justify text with valid token', () => {
      const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

      return request(app.getHttpServer())
        .post('/api/justify')
        .set('Authorization', authToken)
        .set('Content-Type', 'text/plain')
        .send(text)
        .expect(201)
        .expect((res) => {
          expect(res.text).toBeDefined();
          const lines = res.text.split('\n');
          lines.forEach(line => {
            expect(line.length).toBeLessThanOrEqual(80);
          });
        });
    });

    it('should reject request without token', () => {
      const text = 'Test text';

      return request(app.getHttpServer())
        .post('/api/justify')
        .set('Content-Type', 'text/plain')
        .send(text)
        .expect(401);
    });

    it('should reject request with malformed token', () => {
      const text = 'Test text';

      return request(app.getHttpServer())
        .post('/api/justify')
        .set('Authorization', 'InvalidFormat')
        .set('Content-Type', 'text/plain')
        .send(text)
        .expect(401);
    });

    it('should reject text with word exceeding 80 characters', () => {
      const longWord = 'a'.repeat(81);
      const text = `Test ${longWord} text`;

      return request(app.getHttpServer())
        .post('/api/justify')
        .set('Authorization', authToken)
        .set('Content-Type', 'text/plain')
        .send(text)
        .expect(400);
    });
  });
});
