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
import {
  ACTION_SELECT,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../constants';
import moment from 'moment';
import { event } from 'jquery';
import Swal from 'sweetalert2';
import { Toast, ToastrService } from 'ngx-toastr';
import { AppConfig } from '../../../config/app.config';

@Component({
  selector: 'app-add-data-gudang',
  templateUrl: './add-data-gudang.component.html',
  styleUrls: ['./add-data-gudang.component.scss'],
})
export class AddDataGudangComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfig2: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {};
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
  selectedRowData: any;
  isShowModalReport: boolean = false;
  disabledPrintButton: boolean = false;
  paramGenerateReport: any = {};
  alreadyPrint: boolean = false;
  protected config = AppConfig.settings.apiServer;
  @ViewChild('formModal') formModal: any;
  // Form data object
  today: Date = new Date();

  formData: any = {
    nomorPesanan: '',
    codeDestination: '',
    namaCabang: '',
    alamatPengiriman: '',
    deliveryStatus: '',
    tglBrgDikirim: '',
    tglTerimaBarang: '',
    tglSuratJalan: '',
    notes: '',
    nomorSuratJan: '',
    keterangan1: '',
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private appService: AppService,
    private toastr: ToastrService
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.customTodayClass = 'today-highlight';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.maxDate = new Date();

    this.dpConfig2.containerClass = 'theme-dark-blue';
    this.dpConfig2.adaptivePosition = true;
    this.dpConfig2.customTodayClass = 'today-highlight';
    this.dpConfig2.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig2.maxDate = new Date();
    this.dpConfig2.minDate = moment().subtract(7, 'days').toDate(); // 7 hari ke belakang
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
    const today = new Date().toISOString().split('T')[0];
    if (!this.formData.tglTransaksi) {
      this.formData.tglTransaksi = moment().format('DD/MM/YYYY');
    }
    this.renderDataTables();
  }

  onKeteranganInput(): void {
    const allowedRegex = /^[A-Za-z0-9\s-]*$/;
    const currentValue = this.formData.notes || '';

    this.charCount = currentValue.length;

    // Cek apakah ada karakter tidak valid
    this.isKeteranganInvalid = !allowedRegex.test(currentValue);
  }

  onBatalPressed(newItem: any): void {
    console.log('newItem', newItem);
    this.formData = {
      nomorPesanan: '',
      codeDestination: '',
      namaCabang: '',
      alamatPengiriman: '',
      deliveryStatus: '',
      tglBrgDikirim: '',
      tglTerimaBarang: '',
      notes: '',
      tglSuratJalan: '',
      nomorSuratJan: '',
      keterangan1: '',
    };

    if (!this.formData.tglTransaksi) {
      this.formData.tglTransaksi = moment().format('DD/MM/YYYY');
    }

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

  actionBtnClick(action: string, data: any = null) {
    this.selectedRo = JSON.stringify(data);
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
    this.onSaveData();
  }

  // isDoNumberValid(){
  //   // dicek apakah  this.selectedRo.nosuratjalan ada
  //   //
  //   if (this.selectedRo.nomorSuratJan && this.selectedRo.nomorSuratJan != this.formData.nomorSuratJan)  {
  //     return false;
  //   }
  //   else if ((this.formData.nomorSuratJan?.length && !/^DO-\d+$/.test(this.formData.nomorSuratJan)) || this.formData.nomorSuratJan.length > 20) {
  //     return true;
  //   }
  //   return false
  // }
  onTglTerimaBarangChange(selectedDate: Date) {
    if (!selectedDate || !this.formData.tglSuratJalan) return;

    const kirim = moment(selectedDate);
    const pesan = moment(this.formData.tglSuratJalan);

    if (kirim.isBefore(pesan, 'day')) {
      this.toastr.error(
        'Tanggal Terima tidak boleh lebih kecil dari Tanggal Surat Jalan'
      );
      this.formData.tglTerimaBarang = null;
    }
  }

  isDoNumberValid() {
    if (
      this.selectedRo &&
      this.selectedRo.nomorSuratJan &&
      this.selectedRo.nomorSuratJan !== this.formData.nomorSuratJan
    ) {
      return false;
    }

    if (this.formData.nomorSuratJan) {
      // pastikan nomorSuratJan ada sebelum akses .length
      if (
        !/^DO-\d+$/.test(this.formData.nomorSuratJan) ||
        this.formData.nomorSuratJan.length > 20
      ) {
        return true;
      }
    }

    return false;
  }

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  onAddDetail() {
    if (
      !this.formData.nomorSuratJan ||
      this.formData.nomorSuratJan.trim() === ''
    ) {
      Swal.fire({
        title: 'Pesan Error',
        html: 'NOMOR SURAT JALAN TIDAK BOLEH DIKOSONGKAN, PERIKSA KEMBALI..!!',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (this.isDoNumberValid()) {
      Swal.fire('Error', 'Nomor Surat Jalan Salah', 'error');
      return;
    } else {
      this.isShowDetail = true;
      console.log(this.formData, 'formData');
      this.formData.tglSuratJalan = moment(
        this.formData.tglSuratJalan,
        'DD/MM/YYYY',
        true
      ).format('DD/MM/YYYY');
      this.formData.tglTerimaBarang = moment(
        this.formData.tglTerimaBarang,
        'DD/MM/YYYY',
        true
      ).format('DD/MM/YYYY');
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
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
          tipePesanan: 'I',
          kodeGroup: 'G',
        };
        this.appService
          .getNewReceivingOrderGudang(params)
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
        {
          data: 'dtIndex',
          title: 'No.',
          render: (data: any) => `<strong>${data || '-'}</strong>`,
        },
        { data: 'nomorPesanan', title: 'No. Pesanan' },
        {
          data: 'tglPesanan',
          title: 'Tgl. Pesan',
          render: (data: any) => this.globalService.transformDate(data),
        },
        {
          data: 'tglKirimBrg',
          title: 'Tgl. Kirim',
          render: (data: any) => this.globalService.transformDate(data),
        },
        {
          data: 'tglBatalExp',
          title: 'Tgl. Expired',
          render: (data: any) => this.globalService.transformDate(data),
        },
        { data: 'kodeCabang', title: 'Kode' },
        { data: 'namaCabang', title: 'Nama Gudang' },
        { data: 'alamat1', title: 'Alamat Gudang' },
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
    this.formData.nomorPesanan = orderData.nomorPesanan;
    this.formData.tglSuratJalan = moment().toDate();
    this.formData.tglBrgDikirim =
      moment(orderData.tglKirimBrg, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.tglTerimaBarang = moment().toDate();
    this.formData.codeDestination = orderData.supplier;
    this.formData.namaCabang = orderData.namaCabang;
    this.formData.deliveryStatus =
      orderData.statusAktif == 'A' ? 'Aktif' : 'Tidak Aktif';
    this.formData.alamat1 = orderData.alamat1;
    // this.formData.notes = orderData.KETERANGAN1;
    this.formData.validatedDeliveryDate = this.formData.tglBatalExp;
    // this.formData.nomorSuratJan = orderData.noSuratJalan;
    this.formData.nomorSuratJan ="";
    this.getNoPesanan();
    console.log('Mapped form data: ', this.formData);
  }

  onPreviousPressed(): void {
    this.router.navigate([
      '/transaction/receipt-from-warehouse/display-data-dari-gudang',
    ]);
  }

  getNoPesanan() {
    this.appService
    .getDoFromHqByNopesanan({
      requestNo: this.formData.nomorPesanan,
      kodeGudang: this.globalService.getUserLocationCode(),
    })
    .subscribe((resp: any) => {
      console.log('Response from getDoFromHqByNopesanan:', resp);
      if (resp.item.length > 0) {
        this.formData.nomorSuratJan = resp.item[0].noPengiriman;
      } else {
        this.toastr.error(
          'Nomor Surat Jalan tidak ditemukan atau koneksi HQ OFFLINE, Silahkan Isi No Surat Jalan secara Manual'  );
      }
    });
  }
}
// @Injectable({
//   providedIn: 'root',
// })
// export class DeliveryDataService {
//   private baseUrl: string = 'http://localhost:8093/inventory'; // Replace with your actual base URL

//   constructor(private http: HttpClient) {}

//   saveDeliveryData(data: any): Observable<any> {
//     const apiUrl = `${this.baseUrl}/inventory/api/delivery-order/status-descriptions`; // Gunakan baseUrl
//     return this.http.post<any>(apiUrl, data);
//   }
// }
