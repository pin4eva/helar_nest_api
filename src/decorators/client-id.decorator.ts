import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SessionId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headerValue = request?.headers?.['x-session-id'];

    if (Array.isArray(headerValue)) {
      return headerValue[0];
    }

    return headerValue as string | undefined;
  },
);
