import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppConfig } from '../config/app.config';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  protected config = AppConfig.settings.apiServer;
  
  getFile(arg0: string, param: { nomorTransaksi: any; }) {
    throw new Error('Method not implemented.');
  }
  saveDeliveryData(deliveryData: { orderNumber: string; deliveryDestination: string; destinationAddress: string; deliveryStatus: string; orderDate: string; deliveryDate: string; expirationDate: string; validatedDeliveryDate: string; notes: string; }) {
    throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient) {}

  postData(
    url: string,
    params: any,
    expectFile: boolean = false
  ): Observable<any> {
    let token = localStorage.getItem('inv_token') ?? '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-TOKEN': token.replaceAll('"', ''),
    });
    if (expectFile) {
      return this.http.post(url, params, { headers, responseType: 'blob' }).pipe(
        catchError(this.handleError)
      );
    }
    return this.http.post(url, params, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  patchData(
    url: string,
    params: any,
    isGeneratePdf: boolean = false
  ): Observable<any> {
    let token = localStorage.getItem('inv_token') ?? '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-TOKEN': token.replaceAll('"', ''),
    });

    if (isGeneratePdf) {
      return this.http.patch(url, params, { headers, responseType: 'blob' });
    }
    return this.http.patch(url, params, { headers });
  }


  getData(url: string): Observable<any> {
    let token = localStorage.getItem('inv_token') ?? '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-TOKEN': token.replaceAll('"', ''),
    });
    return this.http.get(url, { headers: headers });
  }

  getFileExternal(url: string): Observable<any> {
    return this.http.get(url);
  }

  postDummyData(url: string): Observable<any> {
    return this.http.post(
      url,
      {},
      {
        headers: {
          Accept: '*/*',
        },
      }
    );
  }

  searchOrder(orderNumber: string): Observable<any> {
    const url = `your-api-endpoint/orders/${orderNumber}`;
    return this.http.get<any>(url);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }

  deleteData(url: string, params: any): Observable<any> {
    let token = localStorage.getItem('inv_token') ?? '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-TOKEN': token.replaceAll('"', ''),
    });

    return this.http.delete(url, { headers, body: params }).pipe(
      catchError(this.handleError)
    );
  }

  getAppInfo() {
    let appInfo = this.getDataLocalstorage('appInfo');
    const waitSecond = 5;
    if (appInfo == null) {
      let SERVER_URL = this.config.BASE_URL;
      if (SERVER_URL) {
        this.http
          .post(SERVER_URL + '/get-info', {})
          .pipe(
            catchError((error) => {
              console.error('Error getAppInfo:', error);
              setTimeout(() => {
                window.location.reload();
              }, waitSecond * 1000);
              return throwError(() => error);
            })
          )
          .subscribe((appInfos: any) => {
            this.setDataLocalstorage('appInfo', appInfos.data);
            appInfo = appInfos.data;
          });
      } else {
        setTimeout(() => {
          window.location.reload();
        }, waitSecond * 1000);
      }
    }
    return appInfo;
  }

  setDataLocalstorage(key: string, value: any, type: string = 'json') {
    if (type === 'json') {
      value = JSON.stringify(value);
    }
    localStorage.setItem('mpcs_' + key, value);
  }

  getDataLocalstorage(key: string) {
    let data = localStorage.getItem('mpcs_' + key);
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }
}
