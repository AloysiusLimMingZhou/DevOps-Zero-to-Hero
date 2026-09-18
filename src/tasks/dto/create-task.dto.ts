import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateTaskDto{ // Dto is basically a format/guideline on how the data must follow the given format or it'll be rejected during typescript runtime
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)

    title!: string; // We use ! to indicate we're expecting it or it is mandatory

    @IsString()
    @IsNotEmpty()
    text!: string;
}