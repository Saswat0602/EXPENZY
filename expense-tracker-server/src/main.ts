import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import compression = require('compression');
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers - Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
            'http://localhost:5000',
            'http://localhost:3000',
          ],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Enable compression for responses
  app.use(
    compression({
      level: 6, // Balance between speed and compression ratio
      threshold: 1024, // Only compress responses larger than 1KB
    }),
  );

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS with proper configuration
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
      ];

  app.enableCors({
    origin: (origin: any, callback: any) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      if (!origin) return callback(null, true);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (allowedOrigins.indexOf(origin) !== -1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${String(origin)}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Set Global Prefix
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription(
      'Advanced multi-user expense tracking system with comprehensive features including income tracking, savings goals, subscriptions, budgets, and financial analytics',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('expenses', 'Expense tracking and management')
    .addTag('income', 'Income tracking and management')
    .addTag('categories', 'Category management')
    .addTag('budgets', 'Budget management')
    .addTag('savings', 'Savings goals and contributions')
    .addTag('subscriptions', 'Subscription tracking')
    .addTag('loans', 'Loan tracking')
    .addTag('splits', 'Split expense management')
    .addTag('groups', 'Group management')
    .addTag('tags', 'Tag management')
    .addTag('accounts', 'Financial account management')
    .addTag('payment-methods', 'Payment method management')
    .addTag('settings', 'User settings')
    .addTag('analytics', 'Analytics and reporting')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`❤️  Health check: http://localhost:${port}/api/health`);
}
void bootstrap();
