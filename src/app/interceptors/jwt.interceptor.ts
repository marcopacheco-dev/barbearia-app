import { HttpInterceptorFn } from '@angular/common/http';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
    // Lógica do interceptor aqui
    return next(req);
  };