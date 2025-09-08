import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from './entities/course.entity';
import { Student } from 'src/students/entities/student.entity';

@Module({
  imports: [SequelizeModule.forFeature([Course, Student])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
