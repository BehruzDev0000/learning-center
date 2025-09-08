import { IsEmail, IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from "class-validator"

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    full_name:string

    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsPhoneNumber()
    @IsString()
    @IsNotEmpty()
    phone:string

    @IsNumber()
    @IsNotEmpty()
    course_id:number
}
