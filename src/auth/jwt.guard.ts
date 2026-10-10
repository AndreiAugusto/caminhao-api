import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

const jwt = require('jsonwebtoken');

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido!');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET);
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado!');
    }
    // Tokens emitidos antes da separação por empresa não têm empresaId:
    // força um novo login em vez de deixar a requisição sem escopo.
    if (!request.user.empresaId) {
      throw new UnauthorizedException('Sessão expirada, faça login novamente!');
    }
    return true;
  }
}
