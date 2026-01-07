import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable text/plain body parsing
  app.use(express.text({ type: 'text/plain' }));

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Justify API')
    .setDescription('API REST pour justifier du texte avec authentification par token et rate limiting')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        name: 'Authorization',
        description: 'Enter token received from /api/token endpoint',
        in: 'header',
      },
      'bearer-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();