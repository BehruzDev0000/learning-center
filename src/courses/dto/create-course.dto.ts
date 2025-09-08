import { IsDateString, IsNotEmpty, IsString } from "class-validator"

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    name:string

    @IsString()
    @IsNotEmpty()
    description:string

    @IsDateString()
    @IsString()
    @IsNotEmpty()
    start_date:string

    @IsDateString()
    @IsString()
    @IsNotEmpty()
    end_date:string
}
