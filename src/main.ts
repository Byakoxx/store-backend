import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad
  app.enableCors();
  app.use(helmet());

  // Prefijo global para versionamiento
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Store API')
    .setDescription('API for the store')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
