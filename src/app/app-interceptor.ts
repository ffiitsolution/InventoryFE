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
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Bisa ditambahkan success toast jika perlu
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.toastr.error('Sesi Anda telah habis. Silakan login kembali.', 'Error 401');
          this.router.navigateByUrl('/login');
        } else if (error.status === 403) {
          this.toastr.warning('Anda tidak memiliki izin untuk melakukan aksi ini.', 'Error 403');
        } else if (error.status === 500) {
          this.toastr.error('Terjadi kesalahan pada server. Silakan coba lagi nanti.', 'Error 500');
        } else {
          this.toastr.error(` ${error.error.message}`, 'Error');
        }
        return throwError(() => error);
      })
    );
  }
}