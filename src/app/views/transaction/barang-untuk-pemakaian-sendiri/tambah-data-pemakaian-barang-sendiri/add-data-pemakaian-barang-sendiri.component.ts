import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Page } from '../../../../model/page';
import { AppService } from '../../../../service/app.service';
import {
  ACTION_SELECT,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../../constants';
import moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-data-pemakaian-barang-sendiri',
  templateUrl: './add-data-pemakaian-barang-sendiri.component.html',
  styleUrls: ['./add-data-pemakaian-barang-sendiri.component.scss'],
})
export class AddDataPemakaianBarangSendiriComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRo: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  charCount: number = 0;
  isKeteranganInvalid: boolean = false;
  paramGenerateReport: any = {};
  isShowModalReport: boolean = false;
  disabledPrintButton: boolean = false;
  alreadyPrint: boolean = false;

  data: { totalQty: number }[] = []; // Declare and initialize the data property

  @ViewChild('formModal') formModal: any;
  // Form data object
  today: Date = new Date();

  formData = {
    keterangan: '',
    tglTransaksi: '',
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService,
    private appService: AppService
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.customTodayClass = 'today-highlight';
  }

  ngOnInit(): void {
    this.dpConfig = {
      dateInputFormat: 'DD/MM/YYYY',
      containerClass: 'theme-red',
      customTodayClass: 'today-red',
      minDate: this.today,
      maxDate: this.today,
    };
    const today = new Date().toISOString().split('T')[0];
    this.minDate = new Date(today);
    this.dpConfig.customTodayClass = 'today-highlight';

    if (!this.formData.tglTransaksi) {
      this.formData.tglTransaksi = moment().format('DD/MM/YYYY');
    }
  }

  onKeteranganInput(): void {
    const allowedRegex = /^[A-Za-z0-9\s-]*$/;
    const currentValue = this.formData.keterangan || '';

    this.charCount = currentValue.length;

    // Cek apakah ada karakter tidak valid
    this.isKeteranganInvalid = !allowedRegex.test(currentValue);
  }
  onBatalPressed(newItem: any): void {
    console.log('newItem', newItem);
    this.isShowDetail = false;
    if (newItem) this.onShowModalPrint(newItem);
  }

  onShowModalPrint(data: any) {
    console.log('ini data', data);

    this.paramGenerateReport = {
      nomorTransaksi: data.nomorTransaksi,
      userEntry: '',
      jamEntry: '',
      tglEntry: '',
      outletBrand: 'KFC',
      kodeGudang: this.globalService.getUserLocationCode(),
      isDownloadCsv: false,
      reportName: 'cetak-pemakaian-barang-sendiri',
      confirmSelection: 'Ya',
    };
    this.isShowModalReport = true;
  }

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  onAddDetail() {
    if (!this.formData.tglTransaksi) {
      Swal.fire({
        icon: 'error',
        title: 'Tanggal Belum Dipilih',
        text: 'Silakan pilih Tanggal Transaksi terlebih dahulu.',
      });
      return;
    }

    this.formData.tglTransaksi = moment(
      this.formData.tglTransaksi,
      'DD-MM-YYYY'
    ).format('DD-MM-YYYY');
    this.globalService.saveLocalstorage(
      'headerWastage',
      JSON.stringify(this.formData)
    );
    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return (
      !this.formData.tglTransaksi ||
      !this.formData.keterangan.trim() ||
      this.formData.keterangan.length > 50 ||
      this.isKeteranganInvalid
    );
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage('headerWastage');
  }

  onPreviousPressed(): void {
    this.router.navigate([
      '/transaction/barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri',
    ]);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  sumTotalRowkodeBarang() {
    let total = 0;
    this.data.forEach((item) => {
      total += item.totalQty;
    });
    return total;
  }

}
@Injectable({
  providedIn: 'root',
})
export class DeliveryDataService {
  constructor(private http: HttpClient) {}

  saveDeliveryData(data: any): Observable<any> {
    const apiUrl =
      'http://localhost:8093/inventory/api/delivery-order/status-descriptions';
    return this.http.post<any>(apiUrl, data);
  }
}


