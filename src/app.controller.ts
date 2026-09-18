import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service.js";

@Controller()
export class AppController{
    constructor(private readonly appService: AppService){} // Since AppController requires AppService for its internal logic, we injects AppService which means to call NestJS to load an instance of AppService and allow AppController to access the instance methods.

    @Get('health') // Define the HTTP method and inside param is path. Basically GET /health
    getHealth(){
        return this.appService.getHealth(); // Call AppService getHealth() method, which returns the simple json we mentioned earlier
    }
}