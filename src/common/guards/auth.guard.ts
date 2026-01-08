import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization'];

        if (!token) {
            throw new UnauthorizedException('Authorization header is required');
        }

        // Simple validation - in production, validate against stored tokens
        if (!token.startsWith('Bearer ') || token.length < 20) {
            throw new UnauthorizedException('Invalid token format');
        }

        // Store the token for use in the service
        request.token = token;

        return true;
    }
}