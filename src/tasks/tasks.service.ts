import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(@InjectRepository(Task) private readonly tasksRepository: Repository<Task>){} // InjectRepository is from TypeORM which allow TasksService to call the methods from tasksRepository instance and directly manipulate with the database tables

    async findAll(): Promise<Task[]> { // async allows this function to return a Promise datatype first and await for other tasks inside. While async function is pending, JS can process other work instead of being blocked. Promise means a data type where it will return something later once the method is completed. In this case it'll return an array of Task objects
        return this.tasksRepository.find({ // basically find() here means findAll, and the params inside just arrange the list by creation time in descending order, meaning latest to earliest
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findOneById(id: number): Promise<Task> {
        const task = await this.tasksRepository.findOneBy({ id }); // Wait for the tasksRepository to access the database and find the data row based on the given id

        if (!task) throw new NotFoundException(`Task with id ${id} not found!`); // If no task with the id is found return 404 Not Found Error

        return task;
    }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const task = this.tasksRepository.create(createTaskDto); // TasksRepository create() method help create a Task object and store it inside the memory
        
        try{
            return await this.tasksRepository.save(task); // Use tasksRepository to create a data row into the database based on the given data which is listed in the form of createTaskDto format
        } catch{
            throw new InternalServerErrorException('Task cannot be created') // If the database has errors and the task cannot be created, throw 500 internal server error
        }
    }

    async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const updates = Object.fromEntries(Object.entries(updateTaskDto).filter(([, value]) => value !== undefined)) as Partial<UpdateTaskDto>

        if(Object.keys(updates).length === 0) { // Check if all the fields in updateTaskDto is empty. If so throw 400 bad request error, if not continue
            throw new BadRequestException('At least one update field is required!');
        }

        const task = await this.tasksRepository.findOneBy({ id }); // Find the task to be updated based on the given id

        if (!task) throw new NotFoundException(`Task with id ${id} not found!`); // If no tasks are found throw 404 not found error

        Object.assign(task, updates); // Update the tasks with the value in updateTaskDto

        return this.tasksRepository.save(task); // Save the tasks into database with tasksRepository methods
    }

    async delete(id: number): Promise<void> {
        const task = await this.tasksRepository.findOneBy({ id }); // Find the task to be deleted based on given id

        if (!task) throw new NotFoundException(`Task with id ${id} not found!`); // If no tasks are found throw 404 not found error

        await this.tasksRepository.delete(task.id); // Call the tasksRepository method to delete the task based on its id from the database
    }
}
