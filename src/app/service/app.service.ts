import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { AppConfig } from '../config/app.config';
import { DataService } from './data.service';
import { TranslationService } from './translation.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    private dataService: DataService,
    private translation: TranslationService,
    private toastr: ToastrService
  ) {}
  protected config = AppConfig.settings.apiServer;

  login(param: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/auth/login',
      param
    );
  }

  getListMenu(): Observable<any> {
    const languange = this.translation.getCurrentLanguage();
    const url = `../../assets/config/listMenu-${languange}.json`;
    return this.dataService.getData(url);
  }

  getSuppliers(): Observable<any> {
    return this.dataService.getData(this.config.BASE_URL + '/master/supplier');
  }

  insert(url: String, params: any): Observable<any> {
    return this.dataService.postData(this.config.BASE_URL + url, params);
  }
  patch(url: string, params: any): Observable<any> {
    return this.dataService.patchData(this.config.BASE_URL + url, params);
  }
  
  getReceivingOrderItem(nomorPesanan: String) {
    return this.dataService.postData(
      `${this.config.BASE_URL_HQ}/api/receiving-order/get-items-receiving-order`,
      { nomorPesanan }
    );
  }

  insertReceivingOrder(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/receiving-order/insert-receiving-from-warehouse`,
      payload
    );
  }

  updateReceivingOrderStatus(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL_HQ}/api/receiving-order/update`,
      payload
    );
  }
}
