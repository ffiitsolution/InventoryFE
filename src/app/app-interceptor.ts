import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from './service/global.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastr: ToastrService,
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    try {
      const userDataStorage = localStorage.getItem('inv_currentUser');
      const userData = JSON.parse(userDataStorage || '{}');

      const ipOutlet = localStorage.getItem('boffi_ipOutlet');

      if (userData) {
        const currentUrl: string = window.location.href;
        let url = '';

        const hashIndex = currentUrl.indexOf('/#/');
        const hashIndex1 = currentUrl.indexOf('/boffi/');

        if (hashIndex !== -1) {
          url = currentUrl.substring(hashIndex + 2);
        } else if (hashIndex1 !== -1) {
          url = currentUrl.substring(hashIndex1 + 6);
        }

        if (request.body instanceof FormData) {
          request.body.append('actUser', userData.kodeUser || '');
          request.body.append('actName', userData.namaUser || '');
          request.body.append('actUrl', url);
          request.body.append('actLocation', userData.defaultLocation?.kodeLocation || '');
        } else {
          request = request.clone({
            body: {
              ...request.body,
              actUser: userData.kodeUser || '',
              actName: userData.namaUser || '',
              actUrl: url,
              actLocation: userData.defaultLocation?.kodeLocation || '',
            }
          });
        }
      }
    } catch (error) {
      console.error('Error enriching request:', error);
    }

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Success response handler (optional)
        }
      }),
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this.toastr.error('Silakan login kembali.', 'Sesi Anda telah habis.');
            this.router.navigateByUrl('/login');
            break;
          case 400:
            this.toastr.warning(
              error?.error?.message || error?.message || 'Permintaan tidak valid',
              'Terjadi kesalahan.'
            );
            break;
          case 403:
            this.toastr.warning('Anda tidak memiliki izin untuk melakukan aksi ini.', 'Terjadi kesalahan.');
            break;
          case 404:
            this.toastr.warning('Data yang Anda cari tidak ditemukan.', 'Terjadi kesalahan.');
            break;
          case 500:
            this.toastr.error('Internal server error.', 'Terjadi kesalahan.');
            break;
          case 0:
            this.toastr.error('Gagal menghubungkan ke server.', 'Terjadi kesalahan.');
            break;
          default:
            this.toastr.error('Terjadi kesalahan.', 'Error');
            console.error(error);
        }

        return throwError(() => error);
      })
    );
  }
}
