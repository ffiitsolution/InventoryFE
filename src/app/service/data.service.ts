import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  saveDeliveryData(deliveryData: { orderNumber: string; deliveryDestination: string; destinationAddress: string; deliveryStatus: string; orderDate: string; deliveryDate: string; expirationDate: string; validatedDeliveryDate: string; notes: string; }) {
    throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient) {}

  postData(
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
      return this.http.post(url, params, { headers, responseType: 'blob' });
    }
    return this.http.post(url, params, { headers });
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
}
