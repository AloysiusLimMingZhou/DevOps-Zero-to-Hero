import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AppService {
    constructor(private readonly dataSource: DataSource){};

    async getHealth() {
        try {
            await this.dataSource.query('SELECT 1'); // Write a short SQL query to test if the database is alive

            return { // Return a simple json response with timestamp showing its ok
                status: 'healthy',
                service: 'devops-api',
                database: 'connected',
                timestamp: new Date().toISOString()
            }
        }

        catch {
            throw new ServiceUnavailableException('Database Unavailable'); // Catch error with httpcode 503 Service Unavailable
        }
    }
}