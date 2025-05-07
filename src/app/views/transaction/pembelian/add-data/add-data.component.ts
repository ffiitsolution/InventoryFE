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
import Swal from 'sweetalert2';
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../../constants';
import moment from 'moment';
import { Page } from '../../../../model/page';
import { AppService } from '../../../../service/app.service';

@Component({
  selector: 'app-add-data-pembelian',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],

})
export class AddPembelianComponent implements OnInit, AfterViewInit, OnDestroy {
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
  charCount: number = 0;
  isKeteranganInvalid: boolean = false;
  invalidNotes: boolean = false; // Added property to fix the error
  @ViewChild('formModal') formModal: any;
  // Form data object
  formData: any = {
    notes: ''
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    public globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService,
    private appService: AppService
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
    this.globalService.navbarVisibility = true;

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

  get isFormInvalid(): boolean {
    return Object.values(this.formData).some(value => value === '');
  }

  onAddDetail() {
    if (!this.formData.nomorDokumen || this.formData.nomorDokumen.trim() === '') {
      Swal.fire({
        title: 'Peringatan!',
        text: 'NOMOR DOKUMEN TIDAK BOLEH DIKOSONGKAN, HARAP DIPERIKSA KEMBALI..!!!!',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const regex = /^[a-zA-Z0-9-]+$/;
    if (!regex.test(this.formData.nomorDokumen)) {
      Swal.fire({
        title: 'Nomor Dokumen Salah!',
        text: 'NOMOR DOKUMEN SALAH, HARAP MASUKAN NOMOR DOKUMEN YANG BENAR PERIKSA KEMBALI...!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.invalidNotes) {
      return;
    }

    if (!this.formData.notes || this.formData.notes.trim() === '') {
      alert('Catatan (Keterangan Lain) tidak boleh kosong');
      return;
    }

    this.isShowDetail = true;

    this.globalService.saveLocalstorage(
      'headerPembelian',
      JSON.stringify(this.formData)
    );
  }



  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage(
      LS_INV_SELECTED_DELIVERY_ORDER
    );
  }


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/pembelian/list-dt']);
  }

  onSaveData(): void {
    const today = new Date().getDate();
    this.minDate = new Date(today);
  }
  onShowModal() {
    this.isShowModal = true;
  }

  prosesDobalik() {
    const route = this.router.createUrlTree(['/transaction/delivery-item/dobalik']);
    this.router.navigateByUrl(route);
  }

  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      order: [[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
          tipePesanan: 'S',
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        this.appService.getPOPembelian(params)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.page.start + index + 1,
              };
              return finalData;
            });
            this.page.recordsTotal = resp.recordsTotal;
            this.page.recordsFiltered = resp.recordsFiltered;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'nomorPesanan', title: 'No. Pesanan' },
        { data: 'tglPesanan', title: 'Tgl. Pesan', render: (data) => this.globalService.transformDate(data) },
        { data: 'tglKirimBrg', title: 'Tgl. Kirim', render: (data) => this.globalService.transformDate(data) },
        { data: 'tglBatalExp', title: 'Tgl. Expired', render: (data) => this.globalService.transformDate(data) },
        { data: 'supplier', title: 'Supplier', },
        { data: 'namaSupplier', title: 'Nama Supplier', },
        { data: 'alamatSupplier', title: 'Alamat', },
        {
          data: 'statusPesanan',
          title: 'Status Pesanan',
          render: (data) => {
            const isCancel = data == CANCEL_STATUS;
            const label = this.globalService.getStatusOrderLabel(data, false, true);
            if (isCancel) {
              return `<span class="text-center text-danger">${label}</span>`;
            }
            return label;
          },
        },
        {
          data: 'statusCetak',
          title: 'Status Cetak',
          render: (data) => this.globalService.getStatusOrderLabel(data, true, true),
        },
        {
          title: 'Action',
          render: () => {
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white">Pilih</button>`;
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
    this.formData.nomorPesanan = orderData.nomorPesanan;
    this.formData.supplier = orderData.supplier
    this.formData.namaSupplier = orderData.namaSupplier || '';
    this.formData.alamatSupplier = orderData.alamatSupplier || '';
    this.formData.tglDokumen = moment().format('DD-MM-YYYY');
    this.formData.tglTerimaBrg = moment().format('DD-MM-YYYY');
    this.formData.statusAktif = orderData.statusAktif;
  }

  handleEnter(event: any) {

  }

  updateCharCount() {
    this.charCount = this.formData.notes ? this.formData.notes.length : 0;
    this.invalidNotes = false;
  }

  validateNotes() {
    const notes = this.formData.notes;
    if (notes && !notes.match(/^[a-zA-Z0-9\-]*$/)) {
      this.invalidNotes = true;
    }
  }

  validationTglTerimaBrg: any = null;
  getValidationTglTerimaBrg(isFormatted: boolean = false): any {
      let validationText = '';
      let tempDateTerimaBrg;
      const tempDatePermintaanTerima = this.formData.tglTerimaBrg;
  
      if (isFormatted) {
        tempDateTerimaBrg = this.formData.tglTerimaBrg;
      } else {
        let validatedDate = this.formData.tglTerimaBrg;
        if (typeof validatedDate === 'string') {
          // Coba parse string, tentukan format input string-nya
          validatedDate = moment(validatedDate, 'DD-MM-YYYY').isValid()
            ? moment(validatedDate, 'DD-MM-YYYY')
            : moment(validatedDate);
        } else {
          validatedDate = moment(validatedDate);
        }
        tempDateTerimaBrg = validatedDate.format('DD-MM-YYYY');
      }
  
      const today = moment().format('DD-MM-YYYY');
  
      if (tempDateTerimaBrg !== tempDatePermintaanTerima) {
        validationText += '** TANGGAL Terima TIDAK SESUAI DENGAN PERMINTAAN Terima..!!';
      }
  
      if (tempDateTerimaBrg !== today) {
        validationText += "** TANGGAL Terima 'TIDAK SESUAI' DENGAN TGL. HARI INI, PERIKSA KEMBALI..!!";
      }
  
      this.validationTglTerimaBrg = validationText;
    }
}


@Injectable({
  providedIn: 'root',
})
export class DeliveryDataService {
  constructor(private http: HttpClient) { }
}









