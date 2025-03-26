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
          this.toastr.error('Silakan login kembali.', 'Sesi Anda telah habis.');
          this.router.navigateByUrl('/login');
        } else if (error.status === 400) {
          this.toastr.warning(
            `${error?.error?.message ? error?.error?.message : error?.message}`,
            'Terjadi kesalahan.'
          );
        } else if (error.status === 403) {
          this.toastr.warning(
            'Anda tidak memiliki izin untuk melakukan aksi ini.',
            'Terjadi kesalahan.'
          );
        } else if (error.status === 404) {
          this.toastr.warning(
            `Data yang anda cari tidak ditemukan`,
            'Terjadi kesalahan.'
          );
        } else if (error.status === 500) {
          this.toastr.error(`Internal server error.`, 'Terjadi kesalahan.');
        } else if (error.status === 0) {
          this.toastr.error(
            `Gagal menghubungkan ke server.`,
            'Terjadi kesalahan.'
          );
        } else {
          this.toastr.error(`Terjadi kesalahan.`, 'Error');
          console.log(error);
        }
        return throwError(() => error);
      })
    );
  }
}
