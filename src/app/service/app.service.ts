import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { AppConfig } from '../config/app.config';
import { DataService } from './data.service';
import { TranslationService } from './translation.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    private dataService: DataService,
    private toastr: ToastrService,
    private http: HttpClient,
    private translation: TranslationService,
    private g: GlobalService
  ) {
    this.checkServerTime();
  }
  protected config = AppConfig.settings.apiServer;

  login(param: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/auth/login',
      param
    );
  }

  defaultGudang(param: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/auth/default-gudang',
      param
    );
  }

  getToken() {
    // if (!localStorage.getItem('inv_listMenu')) {
    //   return null;
    // }
    if (!localStorage.getItem('inv_token')) {
      return null;
    }
    if (localStorage.getItem('inv_currentUser')) {
      return localStorage.getItem('inv_currentUser');
    } else {
      return null;
    }
  }

  getUserData() {
    const userString = this.getToken() ?? '';
    return JSON.parse(userString);
  }

  getBaseUrl() {
    return this.config.BASE_URL;
  }

  isLoggednIn() {
    return this.getToken();
  }

  checkServerTime() {
    setInterval(() => {
      this.g.isFullscreen = !!document.fullscreenElement;
      if (this.g.countdownValue === 0) {
        // OFFLINE jika dari websocket tidak ada update
        this.g.serverStatus = 'DOWN';
      } else {
        this.g.countdownValue--;
      }
    }, 1000);
  }

  // untuk menampilkan pesan ketika gagal simpan
  handleErrorResponse(res: any) {
    const titleError = 'Terjadi kesalahan!';
    const data = res.data;
    let error = (data?.error ?? res.error ?? res.message ?? '')
      .toString()
      .toLowerCase();

    if (error.includes('unique constraint') || error.includes('sudah ada')) {
      this.toastr.error('Data sudah pernah dibuat!', titleError);
    } else if (error.includes('year must be between')) {
      this.toastr.error(
        'Mohon cek pengaturan tanggal server/database!',
        titleError
      );
    } else if (
      error.includes('unknown error') ||
      error.includes('http failure response')
    ) {
      this.toastr.error('Koneksi gagal!', titleError);
    } else {
      this.toastr.error(titleError);
    }
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
  updateWarehouse(url: String, params: any): Observable<any> {
    return this.dataService.postData(this.config.BASE_URL_HQ + url, params);
  }
  insertInventory(url: String, params: any): Observable<any> {
    return this.dataService.postData(this.config.BASE_URL + url, params);
  }

  patch(url: string, params: any): Observable<any> {
    return this.dataService.patchData(this.config.BASE_URL + url, params);
  }
  getFile(url: String, params: any): Observable<any> {
    return this.dataService.postData(this.config.BASE_URL + url, params, true);
  }
  getExternal(url: string): Observable<any> {
    return this.dataService.getFileExternal(url);
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

  reporReceivingOrderJasper(params: any): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/receiving-order/report`,
      params,
      true
    );
  }

  reporReceivingPoSupplierJasper(params: any, url: string): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/receiving-po-supplier/report`,
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

  revisiQtyDo(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/revisi-qty-do`,
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

  // getNewReceivingOrderGudang(payload: any) {
  //   return this.dataService.postData(
  //     `${this.config.BASE_URL}/api/delivery-order/search-penerimaan-gudang`,
  //     payload
  //   );
  // }

  getNewReceivingOrderGudang(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/search-gudang/dt`,
      payload
    );
  }

  getCariDataSupplier(payload: any): Observable<any> {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/cari-data-supplier`,
      payload
    );
  }

  getItemRevisiDO(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/list-item-revisi-do`,
      payload
    );
  }

  getDetailTransaksiPenerimaanGudang(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/detail-transaksi-penerimaan-dari-gudang`,
      payload
    );
  }

  getProductById(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/product/get-by-id`,
      payload
    );
  }

  getProductionProductList(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/production/list-product/dt`,
      payload
    );
  }

  getPOPembelian(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/pembelian/get-purchase-order`,
      payload
    );
  }

  getBahanBakuByResep(param: any) {
    return this.dataService.getData(
      `${this.config.BASE_URL}/api/production/bahanbaku?kode_product=${param}`
    );
  }

  getDetailAddPembelian(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/pembelian/get-detail-pembelian`,
      payload
    );
  }

  getProductResep(param: any) {
    return this.dataService.getData(
      `${this.config.BASE_URL}/api/resep/product/get-by-id?kode_barang=${param}`
    );
  }
  getResepByProduct(param: any) {
    return this.dataService.getData(
      `${this.config.BASE_URL}/api/resep/get-by-id?kode_barang=${param}`
    );
  }

  getBahanBakuList(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/resep/bahan-baku/dt`,
      payload
    );
  }

  deleteResepRow(payload: any) {
    return this.dataService.deleteData(
      `${this.config.BASE_URL}/api/resep/`,
      payload
    );
  }

  getProfileCompany() {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/profile/company`,
      {}
    );
  }

  checkEndpointHqWh(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/check-endpoint`,
      payload
    );
  }

  getSupplier(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/list-supplier`,
      payload
    );
  }
  generatePlanningOrder(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/planning-order/generate`,
      payload
    );
  }

  getBranchList(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/branch/dt`,
      payload
    );
  }

  getProductWastedList(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/product-wasted/dt`,
      payload
    );
  }

  getExpiredData(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/expired/list`,
      payload
    );
  }

  getExpiredPemakaian(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/exp-sendiri/list`,
      payload
    );
  }

  checkNoReturExistPenerimaanBrgBks(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/whbkshd/check-nodoc`,
      payload
    );
  }

  getProductReturnList(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/product-return/dt`,
      payload
    );
  }

  checkNoReturFromSiteExist(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/whrtchd/check-nodoc`,
      payload
    );
  }

  listReturSupplier(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/retur-supplier/list`,
      payload
    );
  }

  detailProductionAndExpired(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/production/details`,
      payload
    );
  }

  postingProduction(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/production/posting`,
      payload
    );
  }
  getSummaryKirimProduction(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/production/summary-kirim`,
      payload
    );
  }

  kirimProduction(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/production/kirim`,
      payload
    );
  }

  getSummaryPostingProduction(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/production/summary-posting`,
      payload
    );
  }
  // Activity Log
  listActivityLogFiles(payload: any): Observable<any> {
    return this.dataService.postData(
      `${this.config.BASE_URL}/list-log`,
      payload
    );
  }

  mpcsDefaultGudang(payload: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/auth/mpcs-default-gudang',
      payload
    );
  }

  listSetupTransaksiDt(payload: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/setup-transaksi/dt',
      payload
    );
  }

  hakAksesSidebar(payload: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/role/hak-akses-sidebar',
      payload
    );
  }

  hakAksesModule(payload: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/role/hak-akses-module',
      payload
    );
  }

  getSummaryFinishProduction(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/production/summary-finish`,
      payload
    );
  }
  getDoFromHqByNopesanan(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/delivery-order/by-nopesanan`,
      payload
    );
  }

  getListDriver(payload: any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/driver',
      payload
    );
  }
  // By Raymond 2 Juli 2025
  getAllBranchCode(payload:any): Observable<any> {
    return this.dataService.postData(
      this.config.BASE_URL + '/api/branch',
      payload
    )
  }

  getKodeOutletByNomorRute(payload:any): Observable<any> {
      return this.dataService.postData(
      this.config.BASE_URL + '/api/kode-outlet',
      payload
    )
  }

  getRoutePoints(routeNo: String): Observable<any> {
    return this.dataService.getData(`${this.config.BASE_URL}/api/route?routeNo=${routeNo}`)
  }

  checkStockOpnameDate(payload: any) {
    return this.dataService.postData(
      `${this.config.BASE_URL}/api/check-stock-opname-date`,
      payload
    );
  }
}
