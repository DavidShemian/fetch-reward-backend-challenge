import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import AppModule from './app.module';
import LoggingInterceptor from './interceptors/logging.interceptor';

const bootstrap = async (): Promise<void> => {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            forbidUnknownValues: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );

    app.useGlobalInterceptors(new LoggingInterceptor());

    // Adds Swagger
    const docConfig = new DocumentBuilder().setTitle('Fetch rewards backend challenge API').build();

    const document = SwaggerModule.createDocument(app, docConfig);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
};

bootstrap();
