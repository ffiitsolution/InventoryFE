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
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../../constants';
import moment from 'moment';
import Swal from 'sweetalert2';
// import { AddDataDetailPemakaianBarangSendiriComponent } from './add-data-pemakaian-barang-sendiri.component.spec';

@Component({
  selector: 'add-data-pemakaian-barang-sendiri',
  templateUrl: './add-data-pemakaian-barang-sendiri.component.html',
  styleUrls: ['./add-data-pemakaian-barang-sendiri.component.scss'],

})
export class AddDataPemakaianBarangSendiriComponent implements OnInit, AfterViewInit, OnDestroy {
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
  isShowDetail: boolean = true;

  @ViewChild('formModal') formModal: any;
  // Form data object
  formData = {
    keterangan: '',
    tglTransaksi: '',
    jumlahItem: 0,
  };

  item: any[] = [];
  keterangan: string = '';
  validatedDeliveryDate: string = '';

  onSaveData(): void {
    this.validatedDeliveryDate = new Date().toISOString().split('T')[0];
  }

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService,
    private appService: AppService,
    private http: HttpClient
    
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
  }


  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );
    const today = new Date().toISOString().split('T')[0];
    this.minDate = new Date(today);
  }

  onAddDetail() {
    this.formData.tglTransaksi = moment(this.formData.tglTransaksi, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';

    this.globalService.saveLocalstorage(
      'headerPemakaianBarang',
      JSON.stringify(this.formData)

    );
    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return Object.values(this.formData).some(value => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage(
      'headerWastage',
    );
  }


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/delivery-item']);
  }

  onShowModal() {
    this.isShowModal = true;
  }


validateData() {
  if (!this.formData.keterangan || !this.formData.tglTransaksi || !this.formData.jumlahItem) {
    Swal.fire('Error', 'Semua kolom wajib diisi!', 'error');
    return false;
  }
  return true;
}

onSubmit() {
  if (!this.validateData()) return;

  this.http.post('http://localhost:8080/api/tambah-data-pemakaian-barang-sendiri', this.formData)
    .subscribe(response => {
      Swal.fire('Success', 'Data berhasil ditambahkan!', 'success');
    }, error => {
      Swal.fire('Error', 'Gagal menambahkan data!', 'error');
    });
}
}
@Injectable({
  providedIn: 'root',
})
export class DeliveryDataService {
  constructor(private http: HttpClient) { }

  saveDeliveryData(data: any): Observable<any> {
    const apiUrl = 'http://localhost:8093/inventory/api/delivery-order/status-descriptions';
    return this.http.post<any>(apiUrl, data);
  }

  onAddItem(item: any): boolean {
    if (!item || Object.keys(item).length === 0) {
      Swal.fire('Error', 'Semua kolom wajib diisi!', 'error');
      return false;
    }
    return true;
  }
}

