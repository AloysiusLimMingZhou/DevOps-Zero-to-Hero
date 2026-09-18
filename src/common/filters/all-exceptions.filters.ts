import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";

@Catch() // If an exception is being thrown, catch it and turn into a json error message. Since no params inside @Catch we're catching all types of errors. If @Catch(HttpException) then we're only catching HTTP errors
export class AllExceptionFilter implements ExceptionFilter { // Implements ExceptionFilter interface to use the catch(exception, host) method
    private readonly logger = new Logger(AllExceptionFilter.name); // Create a Logger instance, the .name inside params let Logger know which class creates it (i.e. [NEST] LOG [AllExceptionFilter])

    catch(exception: unknown, host: ArgumentsHost) { // exception means the actual error that is being thrown, while host means where the exception occurs
        const context = host.switchToHttp(); // ArgumentsHost could take different forms of network transport, for example Websocket, GRPC. Here we tell ArgumentsHost to excess the context as HTTP Context
        const request = context.getRequest(); // Get HTTP Request details
        const response = context.getResponse(); // Get HTTP Response details

        if(exception instanceof HttpException){ // Check if the exception falls under NestJS known HttpException (i.e. 400, 401, 404, ...)
            const status = exception.getStatus(); // Get HTTP Error status code
            const exceptionResponse = exception.getResponse(); // Get the exception response, which usually consists of the error messages

            const message = 
                typeof exceptionResponse === 'string' // Check if the exception response is string (Meaning the response contains error message) 
                ? exceptionResponse  // If yes we take that message
                : (exceptionResponse as Record<string, any>)['message'] ?? 'Request Failed'; // Else we assume exceptionResponse is an object and extract if there's a 'message' property, if there's no 'message' property then only we create a string 'Request Failed' and put it under exceptionResponse message properties

            response.status(status).json({ // Send a standardised json error response to the client
                statusCode: status,
                message,
                path: request.url,
                timestamp: new Date().toISOString()
            });

            return;
        }
        this.logger.error(exception); // Log the exception in the logger class

        response.status(500).json({ // If the exception does not fall under NestJS known HttpException we just call it as Internal Server Error
            statusCode: 500,
            message: 'Internal Server Error',
            path: request.url,
            timestamp: new Date().toISOString()
        });
    }
}