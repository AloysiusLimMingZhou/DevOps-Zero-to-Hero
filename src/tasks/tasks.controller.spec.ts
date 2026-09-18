import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller.js';
import { Task } from './entities/task.entity.js';
import { vi } from 'vitest';
import { TasksService } from './tasks.service.js';

describe('TasksController', () => {
  let controller: TasksController;

  const service = {
    findAll: vi.fn(),
    findOneById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: service
        }
      ]
    }).compile();

    controller = module.get<TasksController>(TasksController);

    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll route', () => {
    it('delegates findAll to the service', async () => {
      const tasks = [
        {
          id: 1,
          title: 'Task 1',
          text: 'Text 1',
          completed: false
        },

        {
          id: 2,
          title: 'Task 2',
          text: 'Text 2',
          completed: false
        }
      ] as Task[];

      service.findAll.mockResolvedValue(tasks);

      await expect(controller.findAllTasks()).resolves.toEqual(tasks);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    })
  })

  describe('findOne route', () => {
    it('delegates findTaskById to the service', async () => {
      const task = {
          id: 1,
          title: 'Task 1',
          text: 'Text 1',
          completed: false
      } as Task;
      
      service.findOneById.mockResolvedValue(task);

      await expect(controller.findTaskById(1)).resolves.toEqual(task);
      expect(service.findOneById).toHaveBeenCalledTimes(1);
    })
  })

  describe('create route', () => {
    it('delegates createTask to the service', async () => {
      const dto = {
        title: 'Task 1',
        text: 'Text 1'
      }

      const task = {
        id: 1,
        ...dto,
        completed: false
      } as Task;

      service.create.mockResolvedValue(task);

      await expect(controller.createTask(dto)).resolves.toEqual(task);
      expect(service.create).toHaveBeenCalledWith(dto);
    })
  })

  describe('update route', () => {
    it('delegate updateTaskById to the service', async () => {
      const updateDto = {
        completed: true
      }
      const updatedTask = {
        id: 1,
        title: 'Task 1',
        text: 'Text 1',
        completed: true
      } as Task;

      service.update.mockResolvedValue(updatedTask);

      await expect(controller.updateTaskById(1, updateDto)).resolves.toEqual(updatedTask);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    })
  })

  describe('delete route', () => {
    it('delegate deleteTask to the service', async () => {
      service.delete.mockResolvedValue(undefined);
      await expect(controller.deleteTaskById(1)).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledTimes(1);
    })
  })
});
