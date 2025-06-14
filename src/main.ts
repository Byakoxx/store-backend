import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Health endpoint before global prefix
  app.use('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API versioning
  app.setGlobalPrefix('v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Store Backend API')
    .setDescription('E-commerce backend with Payment Gateway integration')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Use PORT from environment or default to 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
