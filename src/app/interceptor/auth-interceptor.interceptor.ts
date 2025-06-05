import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt');
    console.log('Token enviado en el header Authorization:', token);
    if (!token) {
      return next.handle(req);
    }
    const req1 = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next.handle(req1);
  }
}

// Exporta como interceptor funcional para standalone
export const authInterceptorProvider: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  console.log('Token enviado en el header Authorization:', token);
  if (!token) {
    return next(req);
  }
  const req1 = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });
  return next(req1);
};

