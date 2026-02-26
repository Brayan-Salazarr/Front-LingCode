import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/authService';
import { catchError, Observable } from 'rxjs';

/*export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError(error => {

        if (error.status === 401) {

          return this.authService.refreshToken().pipe(
            switchMap(() => {

              const newToken = this.authService.getToken();

              const newRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });

              return next.handle(newRequest);
            }),
            catchError(() => {
              this.authService.logout();
              return throwError(() => error);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
*/