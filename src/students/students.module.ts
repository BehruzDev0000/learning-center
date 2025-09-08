import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Student } from './entities/student.entity';
import { Course } from 'src/courses/entities/course.entity';
@Module({
  imports: [SequelizeModule.forFeature([Student,Course])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
