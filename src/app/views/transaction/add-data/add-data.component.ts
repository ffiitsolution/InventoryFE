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

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],

})
export class AddDataComponent implements OnInit, AfterViewInit, OnDestroy {
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
  validationTglKirimBrg: any = null;
  // Form data object
  formData: any = {
    nomorPesanan: '',
    deliveryStatus: '',
    namaCabang: '',
    alamat1: '',
    alamat2: '',
    keteranganKota: '',
    tglPesan: '',
    tglKadaluarsa: '',
    validatedDeliveryDate: moment(new Date(), 'YYYY-MM-DD').format('DD-MM-YYYY') || '',
    keterangan: '',
    codeDestination: '',
    kodeGudang: ''
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    public globalService: GlobalService,
    private translationService: TranslationService,
    private appService: AppService
  ) {
    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.customTodayClass = 'today-highlight';
  }


  ngOnInit(): void {
    this.bsConfig = Object.assign({}, {
      containerClass: 'theme-default',
      dateInputFormat: 'DD/MM/YYYY', // Wajib ada ini!

    });

    this.globalService.navbarVisibility = true;

    this.renderDataTables();

    const today = new Date();

    const min = new Date(today);
    min.setDate(min.getDate() - 7);

    const max = new Date(today);
    max.setDate(max.getDate() + 7);

    this.minDate = min;
    this.maxDate = max;
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRo = JSON.stringify(data);
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
    this.getValidationTglKirimBrg(true);
  }

  onAddDetail() {
    this.isShowDetail = true;
    this.globalService.saveLocalstorage(
      LS_INV_SELECTED_DELIVERY_ORDER,
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

  getValidationTglKirimBrg(isFormatted: boolean = false): any {
    let validationText = '';
    let tempDateKirimGudang
    const tempDatePermintaanKirim = this.formData.tglBrgDikirim;
    if (isFormatted) {
      tempDateKirimGudang = this.formData.validatedDeliveryDate
    } else {
      tempDateKirimGudang = moment(this.formData.validatedDeliveryDate).format("DD-MM-YYYY");
    }

    const today = moment(new Date().toISOString()).format("DD-MM-YYYY");

    if (tempDateKirimGudang !== tempDatePermintaanKirim) {
      validationText += '** TANGGAL KIRIM TIDAK SESUAI DENGAN PERMINTAAN KIRIM..!!';
    }

    if (tempDateKirimGudang !== today) {
      validationText += "** TANGGAL KIRIM 'TIDAK SESUAI' DENGAN TGL. HARI INI, PERIKSA KEMBALI..!!";
    }

    this.validationTglKirimBrg = validationText;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/delivery-item']);
  }

  onSaveData(): void {
  }
  onShowModal() {
    this.isShowModal = true;
  }

  get fullAlamat(): string {
    return `${this.formData.alamat1 || ''} ${this.formData.alamat2 || ''} ${this.formData.keteranganKota || ''}`.trim();
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
      order: [[2, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        this.appService.getNewReceivingOrder(params)
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
        { data: 'tglPesan', title: 'Tgl. Pesan', render: (data) => this.globalService.transformDate(data) },
        { data: 'tglBrgDikirim', title: 'Tgl. Dikirim', render: (data) => this.globalService.transformDate(data) },
        { data: 'tglKadaluarsa', title: 'Tgl. Expired', render: (data) => this.globalService.transformDate(data) },
        { data: 'kodePemesan', title: 'Pemesan' },
        { data: 'namaCabang', title: 'Nama Pemesan' },
        // {
        //   data: 'statusRecieve',
        //   title: 'Status Penerimaan',
        //   render: (data) => {
        //     const isCancel = data == CANCEL_STATUS;
        //     const label = this.globalService.getsatusDeliveryOrderLabel(data);
        //     if (isCancel) {
        //       return `<span class="text-center text-danger">${label}</span>`;
        //     }
        //     return label;
        //   },
        // },
        {
          data: 'statusCetak',
          title: 'Status Cetak',
          render: (data) => this.globalService.getsatusDeliveryOrderLabel(data, true),
        },
        {
          title: 'Action',
          render: (data: any, type: any, row: any) => {
            const statusCetak = row.statusCetak;
            const expiryDate = new Date(row.tglKadaluarsa);
            const today = new Date();

            if (expiryDate >= today) {
              if (statusCetak !== 'S') {
                return '<span class="text-center text-warning">Data Belum Dicetak</span>';
              }
              return `<button class="btn btn-sm action-select btn-info btn-80 text-white">Pilih</button>`;
            } else {
              return '<span class="text-center text-danger">Data kadaluarsa</span>';
            }
          }

        }
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
    this.formData.deliveryStatus = 'Aktif';
    this.formData.codeDestination = orderData.kodePemesan
    this.formData.namaCabang = orderData.namaCabang || '';
    this.formData.alamat1 = orderData.alamat1 || '';
    this.formData.alamat2 = orderData.alamat2 || '';
    this.formData.keteranganKota = orderData.keteranganKota || '';
    this.formData.tglPesan = moment(orderData.tglPesan, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.tglBrgDikirim = moment(orderData.tglBrgDikirim, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.tglKadaluarsa = moment(orderData.tglKadaluarsa, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.nomorPesanan = orderData.nomorPesanan || '';
    this.formData.validatedDeliveryDate = this.formData.tglBrgDikirim || '';
    this.formData.kodeGudang = orderData.kodeGudang || '';
  }

  handleEnter(event: any) {

  }
}









