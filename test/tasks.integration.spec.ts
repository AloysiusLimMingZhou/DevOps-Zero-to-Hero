import { Test, TestingModule } from "@nestjs/testing"
import { TasksService } from "../src/tasks/tasks.service.js";
import { Repository } from "typeorm";
import { Task } from "../src/tasks/entities/task.entity.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { TasksModule } from "../src/tasks/tasks.module.js";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe('TasksService integration', () => {
    let moduleRef: TestingModule;
    let service: TasksService;
    let repository: Repository<Task>;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env.test', '.env']
                }),

                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => {
                        const nodeEnv = config.getOrThrow<string>('NODE_ENV');

                        if (nodeEnv !== 'test'){
                            throw new Error('Integration tests require NODE_ENV=test')
                        }

                        return {
                            type: 'postgres' as const,
                            host: config.get<string>('DB_HOST'),
                            port: Number(config.get<string>('DB_PORT')),
                            username: config.get<string>('DB_USERNAME'),
                            password: config.get<string>('DB_PASSWORD'),
                            database: config.get<string>('DB_NAME'),
                            entities: [Task],
                            synchronize: true,
                            dropSchema: true
                        }
                    },
                }),

                TasksModule,
            ],
        }).compile();

        service = moduleRef.get<TasksService>(TasksService);
        repository = moduleRef.get<Repository<Task>>(getRepositoryToken(Task));
    });

    beforeEach(async () => {
        await repository.clear();
    })

    afterAll(async () => {
        await moduleRef.close();
    })

    it('creates and persists a task', async () => {
        const created = await service.create({
            title: 'Task 1',
            text: 'Text 1'
        });

        expect(created.id).toEqual(expect.any(Number));

        const saved = await repository.findOneBy({
            id: created.id
        });

        expect(saved).toMatchObject({
            id: created.id,
            title: 'Task 1',
            text: 'Text 1',
            completed: false
        });
    });

    it('finds all persisted tasks', async () => {
        await service.create({
            title: 'Task 1',
            text: 'Text 1'
        });

        await service.create({
            title: 'Task 2',
            text: 'Text 2'
        });

        const tasks:Task[] = await service.findAll();

        expect(tasks).toHaveLength(2);
        expect(tasks).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: 'Task 1'
                }),
                
                expect.objectContaining({
                    title: 'Task 2'
                }),
            ]),
        );
    });

    it('finds a task by ID', async () => {
        const createdTask: Task = await service.create({
            title: 'Task 1',
            text: 'Text 1'
        });

        const task: Task = await service.findOneById(createdTask.id)

        expect(task).toMatchObject({
            id: createdTask.id,
            title: 'Task 1',
            text: 'Text 1',
            completed: false
        });
    });

    it('throws when finding a missing task', async () => {
        await expect(service.findOneById(999999)).rejects.toThrow(NotFoundException);
    });

    it('updates and persists a task', async () => {
        const createdTask: Task = await service.create({
            title: 'Task 1',
            text: 'Text 1'
        });

        const updatedTask: Task = await service.update(createdTask.id, {
            completed: true
        });

        expect(updatedTask).toMatchObject({
            id: createdTask.id,
            title: 'Task 1',
            text: 'Text 1',
            completed: true
        });

        const saved: Task | null = await repository.findOneBy({
            id: createdTask.id
        });

        expect(saved?.completed).toBe(true);
    });

    it('rejects an empty update', async () => {
        const createdTask: Task = await service.create({
            title: 'Task 1',
            text: 'Text 1'
        });

        await expect(service.update(createdTask.id, {})).rejects.toThrow(BadRequestException);
    });

    it('rejects updating a missing task', async () => {
        await expect(service.update(999999, { completed: true })).rejects.toThrow(NotFoundException);
    })

    it('Deletes a task', async () => {
        const createdTask: Task = await service.create({
            title: 'Task 1',
            text: 'Text 1'
        });

        await service.delete(createdTask.id);

        expect(service.findOneById(createdTask.id)).rejects.toThrow(NotFoundException);
    })

    it('rejects deleting a missing task', async () => {
        await expect(service.delete(999999)).rejects.toThrow(NotFoundException);
    })
})