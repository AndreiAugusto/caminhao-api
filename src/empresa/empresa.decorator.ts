import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Empresa do usuário logado (vem do JWT, preenchido pelo JwtAuthGuard). */
export const EmpresaId = createParamDecorator((_data: unknown, ctx: ExecutionContext): number => {
  return ctx.switchToHttp().getRequest().user.empresaId;
});
