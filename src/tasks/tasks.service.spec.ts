import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity.js';
import { vi } from 'vitest';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  // Define repository
  const repository = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService, 
        {
          provide: getRepositoryToken(Task),
          useValue: repository
        }
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    vi.resetAllMocks();
  });

  // Test if a service exist in tasks module
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test findAll() API function logic from service
  describe('findAll', () => {
      it('finds all tasks', async () => {
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

        repository.find.mockResolvedValue(tasks);

        const result = await service.findAll();

        expect(repository.find).toHaveBeenCalledWith({
          order: {
            createdAt: 'DESC'
          }
        });

        expect(result).toEqual(tasks);
      });
  });

  // Test findOneById() API Function Logic from tasks.service.ts
  describe('findOne', () => {
    it('finds a task by ID', async () => {
      const task = {
        id: 1,
        title: 'Task 1',
        text: 'Text 1',
        completed: false
      } as Task;

      repository.findOneBy.mockResolvedValue(task);

      const result = await service.findOneById(1);

      expect(repository.findOneBy).toHaveBeenLastCalledWith({ id: 1 });

      expect(result).toEqual(task);
    });

    it('throws NotFoundException when task do not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // Test create() API Function Logic from tasks.service.ts
  describe('create', () => {
    it('creates a task', async () => {
      const dto = {
        title: 'This is a test',
        text: 'Test content'
      };

      const task = {
        id: 1,
        ...dto,
        completed: false
      } as Task;

      repository.create.mockReturnValue(task);
      repository.save.mockResolvedValue(task);

      await expect(service.create(dto)).resolves.toEqual(task);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(task);
    });

    it('converts create database errors into InternalServerErrorException', async () => {
      repository.create.mockReturnValue({
        title: 'Task',
        text: 'Text'
      });

      repository.save.mockRejectedValue(new Error('Database Failure'));

      await expect(
        service.create({
          title: 'Task 1',
          text: 'Text 1'
        })
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // Test update() API Function Logic from tasks.service.ts
  describe('update', () => {
    it('updates a task', async () => {
      const oldTask = {
        id: 1,
        title: 'Task 1',
        text: 'Text 1',
        completed: false
      } as Task;

      const updatedTask = {
        ...oldTask,
        completed: true
      } as Task;

      repository.findOneBy.mockResolvedValue(oldTask);
      repository.save.mockResolvedValue(updatedTask);

      const result = await service.update(1, {
        completed: true
      });

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: 1,
      });

      expect(repository.save).toHaveBeenCalledWith({
        id: 1,
        title: 'Task 1',
        text: 'Text 1',
        completed: true
      });

      expect(result).toEqual(updatedTask);
    });

    it('throws when updating a missing task', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(999, {
          completed: true,
        })
      ).rejects.toThrow(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws when updating empty body', async () => {
      await expect(service.update(1, {})).rejects.toThrow(BadRequestException);

      expect(repository.findOneBy).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // Test delete() API Function Logic from tasks.service.ts
  describe('delete', () => {
    it('deletes a task', async () => {
      const task = {
        id: 1,
        title: 'Task 1',
        text: 'Text 1',
        completed: true
      };

      repository.findOneBy.mockResolvedValue(task);
      repository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('throws when deleting a missing task', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);

      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
