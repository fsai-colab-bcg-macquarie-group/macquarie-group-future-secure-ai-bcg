import { config } from 'dotenv'
config()

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'
import { DataSource } from 'typeorm'
import 'reflect-metadata'
import { GlobalExceptionFilter } from './logger/global-exception-filter'
import { Request, Response } from 'express'

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true, // permite registrar logs mesmo durante bootstrap
    })
    const logger = app.get(Logger)
    const PORT = process.env.PORT || 3010

    // Habilita CORS com headers definidos
    app.enableCors({
        origin: [process.env.SITE_URL!],
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, X-Custom-Header',
    })

    // Usa o logger do nestjs-pino
    app.useLogger(app.get(Logger))

    app.useGlobalFilters(new GlobalExceptionFilter(logger))

    app.useGlobalPipes(
        new ValidationPipe({
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    // Swagger setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('API owned by FutureSecure Company.')
        .setDescription(
            'API responsible for managing registrations for the auth-layer and head-agent screens.',
        )
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api-docs', app, document)
    app.getHttpAdapter()
        .getInstance()
        .get('/swagger.json', (_req: Request, res: Response) => {
            res.send(JSON.stringify(document))
        })

    // Executa migrations TypeORM
    const dataSource = app.get(DataSource)
    await dataSource.runMigrations({
        transaction: 'each',
    })

    // Start server
    await app.listen(PORT)
    app.get(Logger).log(`[MAIN]:App started, available on: ${PORT}`)
}
bootstrap()
