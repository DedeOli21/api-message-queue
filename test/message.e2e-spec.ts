import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MessageController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/messages (POST) - create', async () => {
    const res = await request(app.getHttpServer())
      .post('/messages')
      .send({ content: 'Hello test' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.content).toBe('Hello test');
  });

  it('/messages (GET) - list', async () => {
    const res = await request(app.getHttpServer())
      .get('/messages')
      .expect(200);

    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('/messages/:id (GET) - status', async () => {
    const post = await request(app.getHttpServer())
      .post('/messages')
      .send({ content: 'Status test' })
      .expect(201);

    const id = post.body.id;

    const get = await request(app.getHttpServer())
      .get(`/messages/${id}`)
      .expect(200);

    expect(get.body.id).toBe(id);
    expect(get.body.content).toBe('Status test');
  });

  it('/messages/:id/retry (POST) - retry fail when status not FAILED', async () => {
    const post = await request(app.getHttpServer())
      .post('/messages')
      .send({ content: 'Test retry' })
      .expect(201);

    const id = post.body.id;

    const retry = await request(app.getHttpServer())
      .post(`/messages/${id}/retry`)
      .expect(400);

    expect(retry.body.message).toMatch(/Only failed messages can be retried/i);
  });

  afterAll(async () => {
    await app.close();
  });
});
