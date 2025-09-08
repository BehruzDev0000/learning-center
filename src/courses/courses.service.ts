import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Course } from './entities/course.entity';
import { handleError } from 'src/utils/error.response';
import { successResponse } from 'src/students/entities/success.response';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class CoursesService {
  private readonly CACHE_TTL = 300;
  private readonly COURSES_CACHE_KEY = 'courses:all';

  constructor(
    @InjectModel(Course) private readonly courseModel: typeof Course,
    @InjectRedis() private readonly redis: Redis
  ) {}
  async create(createCourseDto: CreateCourseDto) {
    try {
      const startdate=new Date(createCourseDto.start_date)
      const enddate=new Date(createCourseDto.end_date)
      if(startdate>enddate){
        throw new BadRequestException('Start date cannot be greater than end date')
      }
      const course=await this.courseModel.create({createCourseDto})
      
      await this.redis.del(this.COURSES_CACHE_KEY);
      
      return successResponse(course)
    } catch (error) {
      handleError(error)
    }
  }

  async findAll() {
    try {
      const cachedCourses = await this.redis.get(this.COURSES_CACHE_KEY);
      
      if (cachedCourses) {
        const courses = JSON.parse(cachedCourses);
        return successResponse(courses);
      }
      
      const courses = await this.courseModel.findAll({
        include: [{
          model: Student,
          as: 'students'
        }]
      });
      
      await this.redis.setex(this.COURSES_CACHE_KEY, this.CACHE_TTL, JSON.stringify(courses));
      
      return successResponse(courses)
    } catch (error) {
      handleError(error)
    }
  }

  async findOne(id: number) {
    try {
      const course=await this.courseModel.findOne({
        where:{id}
      })
      if(!course){
        throw new NotFoundException('Course not found')
      }

      return successResponse(course)
    } catch (error) {
      handleError(error)
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const startdate=new Date(updateCourseDto.start_date!)
      const enddate=new Date(updateCourseDto.end_date!)
      if(startdate>enddate){
        throw new BadRequestException('Start date cannot be greater than end date')
      }
      const course=await this.courseModel.update(updateCourseDto,{where:{id},returning:true})
      if(course[0]===0){
        throw new NotFoundException('Course not found')
      }
      
      await this.redis.del(this.COURSES_CACHE_KEY);
      
      return successResponse(course)
    } catch (error) {
      handleError(error)
    }
  }

  async remove(id: number) {
    try {
      const course=await this.courseModel.destroy({where:{id}})
      if(course===0){
        throw new NotFoundException('Course not found')
      }
      
      await this.redis.del(this.COURSES_CACHE_KEY);
      
      return successResponse({message:'Course successfully deleted'},204)
    } catch (error) {
      handleError(error)
    }
  }
}
