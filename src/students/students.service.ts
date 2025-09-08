import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Student } from './entities/student.entity';
import { handleError } from 'src/utils/error.response';
import { Course } from 'src/courses/entities/course.entity';
import { successResponse } from './entities/success.response';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class StudentsService {
  private readonly CACHE_TTL = 300;
  private readonly STUDENTS_CACHE_KEY = 'students:all';

  constructor(
    @InjectModel(Student) private readonly studentModel: typeof Student,
    @InjectModel(Course) private readonly courseModel: typeof Course,
    @InjectRedis() private readonly redis: Redis
  ) {}
  async create(createStudentDto: CreateStudentDto) {
    try {
      const email=await this.studentModel.findOne(
        {where:{email:createStudentDto.email}}
      )
      if(email){
        throw new ConflictException('Email already exists')
      }
      const phone=await this.studentModel.findOne({
        where:{phone:createStudentDto.phone}
      })
      if(phone){
        throw new ConflictException('Phone number already exists')
      }
      const course=await this.courseModel.findOne({
        where:{id:createStudentDto.course_id}
      })
      if(!course){
        throw new NotFoundException('Course not found')
      }
      const student=await this.studentModel.create({createStudentDto})
      
      await this.redis.del(this.STUDENTS_CACHE_KEY);
      
      return successResponse(student,201)
    } catch (error) {
      handleError(error)
    }
  }

  async findAll() {
    try {
      const cachedStudents = await this.redis.get(this.STUDENTS_CACHE_KEY);
      
      if (cachedStudents) {
        const students = JSON.parse(cachedStudents);
        return successResponse(students);
      }
      
      const students = await this.studentModel.findAll({
        include: [{
          model: Course,
          as: 'course'
        }]
      });
      
      await this.redis.setex(this.STUDENTS_CACHE_KEY, this.CACHE_TTL, JSON.stringify(students));
      
      return successResponse(students)
    } catch (error) {
      handleError(error)
    }
  }

  async findOne(id: number) {
    try {
      const student=await this.studentModel.findOne({
        where:{id:id}
      })
      if(!student){
        throw new NotFoundException('Student not found')
      }
      return successResponse(student)
    } catch (error) {
      handleError(error)
    }
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    try {
      const email=await this.studentModel.findOne(
        {where:{email:updateStudentDto.email}}
      )
      if(email){
        throw new ConflictException('Email already exists')
      }
      const phone=await this.studentModel.findOne({
        where:{phone:updateStudentDto.phone}
      })
      if(phone){
        throw new ConflictException('Phone number already exists')
      }
      const course=await this.courseModel.findOne({
        where:{id:updateStudentDto.course_id}
      })
      if(!course){
        throw new NotFoundException('Course not found')
      }
      const student=await this.studentModel.update(updateStudentDto,{where:{id},returning:true})
      if(student[0] === 0) {
        throw new NotFoundException('Student not found');
      }
      
      await this.redis.del(this.STUDENTS_CACHE_KEY);
      
      return successResponse(student[1][0])
    } catch (error) {
      handleError(error)
    }
  }

  async remove(id: number) {
    try {
      const student=await this.studentModel.destroy({where:{id}})
      if(student===0){
        throw new NotFoundException('Student not found')
      }
      
      await this.redis.del(this.STUDENTS_CACHE_KEY);
      
      return successResponse({message:'Student successfully deleted'},204)
    } catch (error) {
      handleError(error)
    }
  }
}
