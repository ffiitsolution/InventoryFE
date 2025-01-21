import { Injectable, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do something if response 200 OK
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          alert('Error 401: Your session is expired. Please re-login.');
          this.router.navigateByUrl('/login');
        } else if (error.status === 403) {
          alert(
            'Error 403: Unauthorized. You have no permission to do this action.'
          );
        } else {
          alert('Error Interceptor: ' + error.message);
        }
        return throwError(error);
      })
    );
  }
}
