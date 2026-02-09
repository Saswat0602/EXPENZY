import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: '🎉 Welcome to Expenzy API!',
      version: '1.0.0',
      description: 'Advanced multi-user expense tracking system',
      endpoints: {
        documentation: '/api/docs',
        health: '/api/health',
      },
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
