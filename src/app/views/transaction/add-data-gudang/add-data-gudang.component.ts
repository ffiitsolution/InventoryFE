import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Page } from '../../../model/page';
import { AppService } from '../../../service/app.service';
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../constants';
import moment from 'moment';
import { event } from 'jquery';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-data-gudang',
  templateUrl: './add-data-gudang.component.html',
  styleUrls: ['./add-data-gudang.component.scss'],

})
export class AddDataGudangComponent implements OnInit, AfterViewInit, OnDestroy {
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
  selectedRowData: any;

  @ViewChild('formModal') formModal: any;
  // Form data object
  
  formData: any = {
    nomorPesanan: '',
    codeDestination: '',
    namaCabang: '',
    alamatPengiriman: '',
    deliveryStatus: '',
    tglBrgDikirim: '',
    notes: '',
    nomorSuratJan: '',
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
  }

  isValidNomorSuratJalan: boolean = true;

  validateNumber(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
      this.isValidNomorSuratJalan = false;
    } else {
      this.isValidNomorSuratJalan = true;
    }
  }

  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );

    this.renderDataTables();
    const today = new Date().toISOString().split('T')[0];
    this.minDate = new Date(today);
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRo = JSON.stringify(data);
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
    this.onSaveData();
  }

  isDoNumberValid(){
    // dicek apakah  this.selectedRo.nosuratjalan ada
    //
    if (this.selectedRo.nomorSuratJan && this.selectedRo.nomorSuratJan != this.formData.nomorSuratJan)  {
      return false;
    }
    else if ((this.formData.nomorSuratJan?.length && !/^DO-\d+$/.test(this.formData.nomorSuratJan)) || this.formData.nomorSuratJan.length > 20) {
      return true;
    }
    return false
  }

  onAddDetail() {
    if (this.isDoNumberValid()) {
      Swal.fire('Error', 'Nomor Surat Jalan Salah', 'error');
      return;
    }
    else{
      this.isShowDetail = true;
      // this.router.navigate(['/transaction/receipt-from-warehouse/tambah-data/detail-add-data-gudang']);
      this.globalService.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(this.formData)
      );
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
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
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      lengthMenu: [[5, 10, 15, 20], [5, 10, 15, 20]],
      searching: true,
      ordering: true,
      paging: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback) => {
        let page = Math.floor(dataTablesParameters.start / dataTablesParameters.length);
        let limit = dataTablesParameters.length || 5;
        let offset = page * limit;
        // this.page.start = dataTablesParameters.start || 0;
        // this.page.length = dataTablesParameters.length|| 10;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
          tipePesanan : 'I',
          // limit : this.page.length,
          // offset : this.page.start,
          limit: limit, 
          offset: offset,
        };
        this.appService.getNewReceivingOrderGudang(params)
          .subscribe((resp: any) => {
            const mappedData = resp.penerimaanGudangList.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                // dtIndex: this.page.start + index + 1,
                dtIndex: offset + index + 1,
              };
              return finalData;
            });
            // this.page.recordsTotal = resp.recordsTotal || mappedData.length;
            // this.page.recordsFiltered = resp.recordsFiltered || mappedData.length;  
            const totalRecords = resp.totalRecords !== undefined && !isNaN(resp.totalRecords) 
              ? resp.totalRecords 
              : mappedData.length;
            callback({
              // recordsTotal: resp.recordsTotal,
              // recordsFiltered: resp.recordsFiltered,
              recordsTotal: totalRecords,
              recordsFiltered: totalRecords,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'dtIndex', title: 'No.', render: (data) => `<strong>${data || '-'}</strong>` },
        { data: 'NOMOR_PESANAN', title: 'Nomor Pesanan' },
        { data: 'SUPPLIER', title: 'Kode Gudang' },
        { data: 'NAMA_CABANG', title: 'Alamat Gudang' },
        { data: 'ALAMAT1', title: 'Alamat Pengirim' },
        { data: 'TGL_KIRIM_BRG', title: 'Tanggal Surat Jalan',
          render: (data) => this.globalService.transformDate(data),
        },
        { data: 'KETERANGAN1', title: 'Keterangan', render: (data) => data ? data : '-' },
        { data: 'NO_SURAT_JALAN', title: 'Nomor Surat Jalan', render: (data) => data ? data : '-'},
        {
          data: 'ALAMAT1',
          title: 'Status Penerimaan',
        },
        {
          data: 'STATUS_CETAK',
          title: 'Status Cetak',
          render: (data) => {
            if (data === 'B') {
              return '<span class="badge bg-warning">Belum</span>'; 
            } else if (data === 'S') {
              return '<span class="badge bg-success">Sudah</span>'; 
            } else {
              return '<span class="badge bg-secondary">Tidak Diketahui</span>'; 
            }
          },
        },
        {
          title: 'Action',
          render: () => {
            return `<button class="btn btn-sm action-select btn-outline-info btn-60">Pilih</button>`;
          },
        },
      ],      
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
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

  private mapOrderData(orderData: any): void {
    console.log('Order data: ', orderData);
    this.formData.nomorPesanan = orderData.NOMOR_PESANAN;
    this.formData.tglPesan = moment(orderData.TGL_PESANAN, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.tglBrgDikirim = moment(orderData.TGL_KIRIM_BRG, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.tglTerimaBarang = moment(orderData.TGL_PESANAN, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.codeDestination = orderData.SUPPLIER;
    this.formData.namaCabang = orderData.NAMA_CABANG;
    this.formData.deliveryStatus = 'Aktif';
    this.formData.alamat1 = orderData.ALAMAT1;
    this.formData.notes = orderData.KETERANGAN1;
    this.formData.validatedDeliveryDate = this.formData.TGL_BATAL_EXP;
    this.formData.nomorSuratJan = orderData.NO_SURAT_JALAN;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/receipt-from-warehouse/display-data-dari-gudang']);
  }

}
@Injectable({
  providedIn: 'root',
})
export class DeliveryDataService {
  private baseUrl: string = 'http://localhost:8093/inventory'; // Replace with your actual base URL

  constructor(private http: HttpClient) { }

  saveDeliveryData(data: any): Observable<any> {
    const apiUrl = `${this.baseUrl}/inventory/api/delivery-order/status-descriptions`; // Gunakan baseUrl
    return this.http.post<any>(apiUrl, data);
  }
}





