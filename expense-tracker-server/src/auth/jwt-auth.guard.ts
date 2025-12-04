import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Log authentication failures for debugging
    if (err || !user) {
      console.error('[JwtAuthGuard] Authentication failed:', {
        error: err?.message,
        info: info?.message,
        hasUser: !!user,
      });

      // Provide clear error messages
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token has expired. Please login again.',
        );
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }

      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('No authentication token provided.');
      }

      throw err || new UnauthorizedException('Authentication failed.');
    }

    return user;
  }
}
