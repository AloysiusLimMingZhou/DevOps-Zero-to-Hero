import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TasksModule } from "./tasks/tasks.module.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { RequestLoggingMiddleware } from "./common/middleware/request-logging.middleware.js";

@Module({ // Indicates it is a module which lists the related components & its dependencies.
          //  Components: #1 the router (controller), #2 the logic (service), #3 the dependencies aka modules it use (import)
    imports: [
        ConfigModule.forRoot({ // environment configuration module which finds and load environment variables for other backend API services
            isGlobal: true, // Set it as global so that other modules which is TasksModule doesn't have to import this one again, though it is bad practice to set everything as global ConfigModule is fine exception.
            envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'] // env file path for NestJS to find and load its config details
        }),

        TypeOrmModule.forRootAsync({ // Setup database server with TypeORM Module. We use forRootAsync instead of forRoot is because our TypeORM params depends on other Module's values instead of directly providing the value (hardcoding)
            inject: [ConfigService], // Ask NestJS to load a ConfigService instance to call its methods for loading our params later
            useFactory: (config: ConfigService) => ({
                type: 'postgres' as const, // db type: mysql, sqlite, postgresql
                host: config.get<string>('DB_HOST'), // DB Hostname, i.e. localhost or AWS/GCP/Azure hostname address
                port: Number(config.get<number>('DB_PORT')), // DB Port Number
                username: config.get<string>('DB_USERNAME'), // DB Acc Username
                password: config.get<string>('DB_PASSWORD'), // DB Password
                database: config.get<string>('DB_NAME'), // DB Name
                autoLoadEntities: true, // Automatically add entities that are registered through TypeOrmModule.forFeature([])
                synchronize: false // Tells TypeORM to automatically synchronise our DB schema with our entities.ts, but not on prod database since that requires migration.
            })
        }),
        TasksModule,
    ],
    controllers: [AppController], // AppController used for routing HTTP requests
    providers: [AppService] // Injectable dependencies (So AppController can inject AppService and apply its functions into the route logic) 
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) { // Add Logging Middleware from RequestLoggingMiddleware
        consumer.apply(RequestLoggingMiddleware).forRoutes('*'); // Apply logging for all route paths in the backend server
    }
}