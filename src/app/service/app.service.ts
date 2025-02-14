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

  getDeliveryOrderItem(nomorPesanan: String) {
    return this.dataService.postData(
      `${this.config.BASE_URL_HQ}/api/delivery-order/get-items-delivery-order`,
      { nomorPesanan }
    );
  }

  insertReceivingOrder(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/receiving-order/insert-receiving-from-warehouse`,
      payload
    );
  }

  insertDeliveryOrder(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/insert-delivery-from-warehouse`,
      payload
    );
  }

  updateReceivingOrderStatus(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL_HQ}/api/receiving-order/update`,
      payload
    );
  }

  updateDeliveryOrderStatus(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL_HQ}/api/delivery-order/update`,
      payload
    );
  }

  reporReceivingOrderJasper(params: any, url: string): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/receiving-order/report`,
      params,
      true
    );
  }

  getUomList() {
    return this.dataService.getData(`${this.config.BASE_URL}/api/uom/list`);
  }

  getSupplierList() {
    return this.dataService.getData(
      `${this.config.BASE_URL}/api/supplier/list`
    );
  }

  getDefaultOrderGudangList() {
    return this.dataService.getData(
      `${this.config.BASE_URL}/api/product/default-order-gudang`
    );
  }

  getNewReceivingOrder(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/get-new-ro/dt`,
      payload
    );
  }

  getDeliveryItemDetails(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/delivery-items-detail`,
      payload
    );
  }

  updateDeliveryOrderPostingStatus(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/posting-do`,
      payload
    );
  }

  getDetailDoBlik(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/detail-do-balik`,
      payload
    );
  }


  saveDeliveryOrder(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/insert-delivery`,
      payload
    );
  }

  getCityList(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/city/dropdown-city`,
      payload
    );
  }

  getRSCList(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/rsc/dropdown-rsc`,
      payload
    );
  }

  getNewReceivingOrderGudang(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/search-penerimaan-gudang`,
      payload
    );
  }
}
