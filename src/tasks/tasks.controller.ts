import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Controller('tasks') // Creates a root path with the path of /tasks
export class TasksController {
    constructor(private readonly tasksService: TasksService){}; // Injects tasksService to tell NestJS to load a TasksService instance to access its methods

    @Get() // Define HTTP method, here just GET /tasks
    @HttpCode(HttpStatus.OK) // Define HTTP Status to be 200 on success
    findAllTasks() {
        return this.tasksService.findAll(); // calls TasksServices findAll() method to load all the tasks from database. The reason we separate service and controller is for service to act as the internal logic and the controller act as high level abstraction
    }

    @Get(':id') // Define HTTP method and the path params, here is GET /tasks/:id (i.e. GET /tasks/1)
    @HttpCode(HttpStatus.OK) // Define HTTP Status to be 200 on success
    findTaskById(@Param('id', ParseIntPipe) id: number) { // Param decorator means extract the id route params from HTTP request. Use NestJS built in ParseIntPipe. This makes the id must be an integer, for exp /tasks/abc will throw 400 bad request, but /tasks/1 will pass
        return this.tasksService.findOneById(id); // calls TasksService findOneById(id) method to load the specific task with the id param from the database
    }

    @Post() // Define HTTP method, here is POST /tasks
    @HttpCode(HttpStatus.CREATED) // Define HTTP Status to be 201 on success
    createTask(@Body() createTaskDto: CreateTaskDto) { // We use Body decorator here to indicate that we're passing createTaskDto which consists of the task data into the API Body section
        return this.tasksService.create(createTaskDto); // calls TasksService create() method to pass the createTaskDto data and insert it into the database
    }

    @Patch(':id') // Define HTTP method and path params, here is PATCH /tasks/:id (i.e. PATCH /tasks/1)
    @HttpCode(HttpStatus.OK) // Define HTTP Status to be 200 on success
    updateTaskById(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto) { // We extract the id route params from HTTP request, while updateTaskDto in API Body section. ParseIntPipe as usual to block any invalid API requests like /tasks/abc
        return this.tasksService.update(id, updateTaskDto); // calls TasksService update() method to pass id & updateTaskDto from API request and update the database
    }

    @Delete(':id') // Define HTTP method and path params, here is DELETE /tasks/:id (i.e. DELETE /tasks/1)
    @HttpCode(HttpStatus.NO_CONTENT) // Define HTTP Status to be 204 on success
    deleteTaskById(@Param('id', ParseIntPipe) id: number) { // We extract id route params from HTTP request and as usual use ParseIntPipe to block any invalid API request, i.e. /tasks/abc
        return this.tasksService.delete(id); // calls TasksService delete() method to pass id from API request and delete the data row with the specific id from the database
    }
}
