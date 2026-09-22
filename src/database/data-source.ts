import { config } from "dotenv"
import { dirname, join } from "path";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import { Task } from "../tasks/entities/task.entity.js";

const currentEnvironment = process.env.NODE_ENV ?? 'development'

if (currentEnvironment !== 'production'){
    config({
        path: currentEnvironment === 'test' ? '.env.test' : '.env'
    });
}

const requiredEnvironmentVariables = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME'
] as const;

for(const variable of requiredEnvironmentVariables){
    if(!process.env[variable]){
        throw new Error(`Missing environment variable: ${variable}`);
    }
}

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFile);

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    entities: [Task],

    migrations: [join(currentDirectory, 'migrations/*.{ts,js}')],

    synchronize: false
});