import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task])], // Register Task Entity within TasksModule so that TasksService could use/inject Repository<Task> later on
  controllers: [TasksController], // API Routes for TasksModule
  providers: [TasksService], // Internal logic function to be used for TasksController
  exports: [TasksService] // Export tasks services for other modules to use in the future
})
export class TasksModule {}
