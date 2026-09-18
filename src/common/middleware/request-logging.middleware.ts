import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger(RequestLoggingMiddleware.name); // Creates a Logger instance, the .name param inside the class let the Logger know which class creates the Logger (i.e. [Nest] LOG [RequestLoggingMiddleware] GET /tasks 200 14ms)

    use(request: Request, response: Response, next: NextFunction){ // Implements NestMiddleware Interface which requires the use(request, response, next) method
        const startedAt = Date.now();

        response.on('finish', () => { // Creates an event listener that calls this function when the HTTP response is finished. It logs the duration of the request takes, the request method, its URL & status code
            const duration = Date.now() - startedAt;

            this.logger.log(
                `${request.method} ${request.originalUrl} ` +
                `${response.statusCode} ${duration}ms`
            );
        });

        next(); // While waiting the response.on(...) event listener to be finished, run other tasks first
    }
}