import { Module } from '@nestjs/common';
import { CoursesModule } from './courses/courses.module';
import { StudentsModule } from './students/students.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    envFilePath:'.env'
  }),
  RedisModule.forRoot({
    type:'single',
    url:'redis://redis:6379'
  }),
  SequelizeModule.forRoot({
    dialect:'postgres',
      host: 'postgres',
      port:5432,
      username:'postgres',
      password:'2006',
      database:'learningcenter',
      logging:false,
      synchronize:true,
      autoLoadModels:true,
  }),
    CoursesModule, StudentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
