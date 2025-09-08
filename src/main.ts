import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule,} from '@nestjs/swagger';

async function bootstrap() {
  const PORT=Number(process.env.PORT)||3000
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe())
  
  const config=new DocumentBuilder()
  .setTitle('Course Management System')
  .setDescription('This is a course management system')
  .setVersion('1.0')
  .addTag('Courses')
  .build()

  const document=SwaggerModule.createDocument(app,config)
  SwaggerModule.setup('api',app,document)
  
  await app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`);
    console.log(`📚 Swagger is available at http://localhost:${PORT}/api`);
  });
}

bootstrap();
