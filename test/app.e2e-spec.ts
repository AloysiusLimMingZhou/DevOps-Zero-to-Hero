import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { AllExceptionFilter } from '../src/common/filters/all-exceptions.filters.js';
import { Repository } from 'typeorm';
import { Task } from '../src/tasks/entities/task.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let taskRepository: Repository<Task>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );

    app.useGlobalFilters(new AllExceptionFilter());

    await app.init();

    taskRepository = app.get<Repository<Task>>(getRepositoryToken(Task));
  });

  beforeEach(async () => {
    await taskRepository.clear();
  })

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns healthy', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });

  it('GET /tasks returns 200', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      title: 'Task 1',
      text: 'Text 1',
      completed: false
    })
  });

  it('GET /tasks/:id returns 200', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    const response = await request(app.getHttpServer()).get(`/tasks/${created.body.id}`).expect(200);

    expect(response.body).toMatchObject({
      title: 'Task 1',
      text: 'Text 1',
      completed: false
    });
  });

  it('GET /tasks/invalid-id returns 400', async () => {
    await request(app.getHttpServer()).get('/tasks/abc').expect(400);
  });

  it('GET /tasks/missing-id returns 404', async () => {
    await request(app.getHttpServer()).get('/tasks/999999').expect(404);
  });

  it('POST /tasks creates a task', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'Task 1',
      text: 'Text 1',
      completed: false
    });
  });

  it('POST /tasks rejects empty fields', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: '',
        text: ''
      })
      .expect(400);
  });

  it('POST /tasks rejects invalid fields', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 1,
        text: 'Text 1'
      })
      .expect(400);
  });

  it('POST /tasks rejects unknown properties', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1',
        invalidField: true
      })
      .expect(400);
  });

  it('PATCH /tasks/:id updates a task', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({
        completed: true
      })
      .expect(200);

    expect(updated.body.completed).toBe(true);
    expect(updated.body.title).toBe('Task 1');
  });

  it('PATCH /tasks/:id rejects invalid fields', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({
        completed: 3,
      })
      .expect(400);
  });

  it('PATCH /tasks/:id rejects unknown property', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({
        completed: true,
        invalidField: true,
      })
      .expect(400);
  });

  it('PATCH /tasks/:id rejects empty update', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({})
      .expect(400);
  });

  it('PATCH /tasks/:id rejects empty field', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({
        title: '',
        text: 'Text 1'
      })
      .expect(400);
  });

  it('PATCH /tasks/:id rejects missing tasks', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/999999')
      .send({
        completed: true
      })
      .expect(404);
  })

  it('DELETE /tasks/:id deletes a task', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task 1',
        text: 'Text 1'
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/tasks/${created.body.id}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/tasks/${created.body.id}`)
      .expect(404);
  });

  it('DELETE /tasks/:id rejects missing tasks', async () => {
    await request(app.getHttpServer())
      .delete('/tasks/999999')
      .expect(404);
  });
});
