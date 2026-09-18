import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateTaskDto{ // Dto is a guideline of how the data format should be using class-validator and will be checked later through ValidationPipe in main.ts
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string; // We use ? to indicate that its optional

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    text?: string;

    @IsNotEmpty()
    @IsOptional()
    @IsBoolean()
    completed?: boolean;
}