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
import moment from 'moment';
import { data } from 'jquery';
import Swal from 'sweetalert2';
import { HelperService } from '../../../../service/helper.service';

const ACTION_SELECT = 'select';

@Component({
  selector: 'app-add-data-barang-retur',
  templateUrl: './add-data-retur.component.html',
  styleUrls: ['./add-data-retur.component.scss'],
})
export class AddDataBarangReturComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {
    pagingType: 'full_numbers',
    pageLength: 5,
    processing: true,
    autoWidth: false,
    searching: true,
    ordering: true,
  };
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRo: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  selectedRowData: any;
  kodeSupplier: string;
  isKeteranganInvalid: boolean = false;
  charCount: number = 0;

  @ViewChild('formModal') formModal: any;
  today: Date = new Date();

  supplierList: any[] = [];

  formData: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService,
    private appService: AppService,
    private http: HttpClient,
    private helperService: HelperService
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.customTodayClass = 'today-highlight';

    this.formData = {
      tglTransaksi: '',
      kodeSupplier: '',
      namaSupplier: '',
      alamatSupplier: '',
      alamat1: '',
      kodeKota: '',
      deliveryStatus: '',
      statusAktif: '',
      keterangan: '',
    };
  }

  ngOnInit(): void {
    this.dpConfig = {
      dateInputFormat: 'DD/MM/YYYY',
      containerClass: 'theme-red',
      customTodayClass: 'today-red',
      minDate: this.today,
      maxDate: this.today,
    };
    this.renderDataTables();
    const today = new Date().toISOString().split('T')[0];
    this.minDate = new Date(today);
    this.dpConfig.customTodayClass = 'today-highlight';
  }

  onKeteranganInput(): void {
    const allowedRegex = /^[A-Za-z0-9\s-]*$/;
    const currentValue = this.formData.keterangan || '';

    this.charCount = currentValue.length;

    this.isKeteranganInvalid = !allowedRegex.test(currentValue);
  }

  actionBtnClick(action: string, data: any = null) {
    this.kodeSupplier = data.KODE_SUPPLIER;
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
    this.formData.tglTransaksi = this.helperService.formatDate(new Date());
    this.onSaveData();
  }

  ngAfterViewInit(): void {
    if (this.dtElement) {
      this.dtTrigger.next(null);
    } else {
      console.error(
        'dtElement tidak ditemukan, pastikan tabel HTML ada di template.'
      );
    }
  }

  onSaveData(): void {
    const today = new Date().getDate();
    this.minDate = new Date(today);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  renderDataTables(): void {
    this.dtOptions = {
      columnDefs: [{ width: '100vw', targets: 0 }],

      language:
        this.translationService.getCurrentLanguage() == 'id'
          ? this.translationService.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      lengthMenu: [
        [5, 10, 15, 20],
        [5, 10, 15, 20],
      ],
      searching: true,
      ordering: true,
      paging: true,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback:any) => {
        let page = Math.floor(
          dataTablesParameters.start / dataTablesParameters.length
        );
        let limit = dataTablesParameters.length || 5;
        let offset = page * limit;
        const params = {
          ...dataTablesParameters,
          kodeSupplier: this.kodeSupplier || '',
          limit: limit,
          offset: offset,
        };
        this.appService.getCariDataSupplier(params).subscribe((resp: any) => {
          const mappedData = resp.data.map((item: any, index: number) => {
            const { rn, ...rest } = item;
            const finalData = {
              ...rest,
              dtIndex: offset + index + 1,
            };
            return finalData;
          });
          this.page.recordsTotal = resp.totalRecords;
          this.page.recordsFiltered = resp.totalRecords;
          this.supplierList = mappedData;
          callback({
            recordsTotal: resp.totalRecords,
            recordsFiltered: resp.totalRecords,
            data: mappedData,
          });
        });
      },
      columns: [
        {
          data: 'dtIndex',
          title: 'No.',
          render: (data:any) => `<strong>${data || '-'}</strong>`,
        },
        { data: 'KODE_SUPPLIER', title: 'Kode Supplier' },
        { data: 'NAMA_SUPPLIER', title: 'Nama Supplier' },
        { data: 'ALAMAT1', title: 'Alamat Supplier' },
        { data: 'KOTA', title: 'Kota' },
        {
          data: 'STATUS_AKTIF',
          title: 'Status',
          render: (data:any) => (data === 'A' ? 'AKTIF' : 'TIDAK AKTIF'),
        },
        {
          title: 'Action',
          className: 'text-center',
          render: () => {
            return `<button style="width: 100px; color: red; border-color: red;" class="btn btn-sm action-cari btn-outline-danger btn-60 pe-1">Pilih</button>`;
          },
        },
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-cari', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        if (index === 0 && !this.selectedRowData) {
          setTimeout(() => {
            $(row).trigger('td');
          }, 0);
        }
        $('td', row).on('click', () => {
          $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
          if (this.selectedRowData !== data) {
            this.selectedRowData = data;
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
          } else {
            this.selectedRowData = undefined;
          }
        });
        return row;
      },
    };
  }

  public mapOrderData(orderData: any): void {
    this.formData.tglTransaksi = orderData.TGL_TRANSAKSI;
    this.formData.kodeSupplier = orderData.KODE_SUPPLIER;
    this.formData.namaSupplier = orderData.NAMA_SUPPLIER;
    this.formData.alamatSupplier = orderData.ALAMAT1;
    this.formData.kodeKota = orderData.KOTA;
    this.formData.statusAktif = orderData.STATUS_AKTIF;
    this.formData.keterangan = orderData.KETERANGAN1;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/retur-ke-supplier/list-barang-retur']);
  }

  loadSuppliers() {
    this.dtOptions;
  }

  selectSupplier(supplier: any) {
    this.formData.kodeSupplier = supplier.kodeSupplier;
    this.formData.namaSupplier = supplier.namaSupplier;
    this.formData.alamatSupplier = supplier.alamatSupplier;
    this.formData.kodeKota = supplier.kodeKota;
    this.formData.statusAktif = supplier.statusAktif;
    this.isShowModal = false;
  }

  onAddDetail(): void {
    const keterangan = this.formData.keterangan || '';

    if (!this.formData.tglTransaksi || !keterangan.trim()) {
      if (!this.formData.tglTransaksi) {
        Swal.fire({
          icon: 'error',
          title: 'Tanggal Belum Dipilih',
          text: 'Silakan pilih Tanggal Transaksi terlebih dahulu.',
        });
      } else if (!keterangan.trim()) {
        this.isKeteranganInvalid = true;
        Swal.fire({
          icon: 'error',
          title: '❌ Peringatan!',
          text: 'CATATAN/KETERANGAN PENGEMBALIAN BARANG, TIDAK BOLEH DIKOSONGKAN, PERIKSA KEMBALI....!!!!',
          confirmButtonColor: '#d33',
        });
      }
      return;
    }

    console.log(this.formData.tglTransaksi);
    this.formData.tglTransaksi =
      moment(this.formData.tglTransaksi, 'DD/MM/YYYY').format('DD-MM-YYYY') ||
      '';

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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage('headerWastage');
  }

  // onKeteranganChange(): void {
  //   setTimeout(() => {
  //     this.charCount = (this.formData.keterangan || '').length;
  //     this.isKeteranganInvalid = !(this.formData.keterangan || '').trim();
  //   });
  // }
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
