import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies — required for httpOnly JWT cookie auth
  app.use(cookieParser());

  // Global validation: strip unknown fields, throw on bad input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — teacher-web and student-web origins
  const origins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: origins,
    credentials: true, // required for cookies
  });

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

void bootstrap();
