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
import { event } from 'jquery';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-page-awal-do-balik',
  templateUrl: './page-awal-do.component.html',
  styleUrls: ['./page-awal-do.component.scss'],

})
export class PageAwalDoBalikComponent implements OnInit, AfterViewInit, OnDestroy {
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
  protected config = AppConfig.settings.apiServer;

  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - 1
    )
  );

  endDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() + 1
    )
  );
  dateRangeFilter: any = [this.startDateFilter, this.endDateFilter];

  @ViewChild('formModal') formModal: any;
  // Form data object

  formData: any = {
    nomorPesanan: '',
    codeDestination: '',
    namaCabang: '',
    alamatPengiriman: '',
    deliveryStatus: '',
    tglBrgDikirim: '',
    note: '',
    nomorSuratJan: '',
    statusPosting: '',
    kota: '',
    alamatTujuan: '',
    alamat2: ''
  };


  constructor(
    private router: Router,
    private dataService: DataService,
    public globalService: GlobalService,
    private translationService: TranslationService,
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

  isDoNumberValid() {
    // dicek apakah  this.selectedRo.nosuratjalan ada
    //
    if (this.selectedRo.nomorSuratJan && this.selectedRo.nomorSuratJan != this.formData.nomorSuratJan) {
      return false;
    }
    else if ((this.formData.nomorSuratJan?.length && !/^DO-\d+$/.test(this.formData.nomorSuratJan)) || this.formData.nomorSuratJan.length > 20) {
      return true;
    }
    return false
  }

  onAddDetail() {  
      this.isShowDetail = true;
      // this.router.navigate(['/transaction/receipt-from-warehouse/tambah-data/detail-add-data-gudang']);
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
      order: [4, 'desc'],
      lengthMenu: [[5, 10, 15, 20], [5, 10, 15, 20]],
      searching: true,
      ordering: true,
      paging: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback) => {
        let page = Math.floor(dataTablesParameters.start / dataTablesParameters.length);
        let limit = dataTablesParameters.length || 5;
        // this.page.start = dataTablesParameters.start || 0;
        // this.page.length = dataTablesParameters.length|| 10;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
          tipePesanan: 'I',
          startDate: moment(this.dateRangeFilter[0]).set({
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          }).format('YYYY-MM-DD HH:mm:ss.SSS'),
          endDate: moment(this.dateRangeFilter[1]).set({
            hours: 23,
            minutes: 59,
            seconds: 59,
            milliseconds: 999,
          }).format('YYYY-MM-DD HH:mm:ss.SSS'),
          limit: limit,
        };
        this.dataService
          .postData(this.config.BASE_URL + '/api/delivery-order/dt', params).subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
              };
              return finalData;
            });
            this.page.recordsTotal = resp.recordsTotal || mappedData.length;
            this.page.recordsFiltered = resp.recordsFiltered || mappedData.length;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        {
          data: 'tglTransaksi', title: 'Tgl. Kirim', 
          render: (data) => {
            return this.globalService.transformDate(data)
          }
        },
        { data: 'tglPesanan', title: 'Tgl. Pesan',
          render: (data) => {
            return this.globalService.transformDate(data)
          }
         },
        { data: 'nomorPesanan', title: 'No. Pesanan', searchable: true },
        { data: 'noSuratJalan', title: 'No. Pengiriman', searchable: true },
        {
          data: 'kodeTujuan',
          title: 'Kode Tujuan',
          orderable: true,
          searchable: true,
        },
        {
          data: 'namaTujuan',
          title: 'Tujuan',
          orderable: true,
          searchable: true,
        },
        {
          title: 'Aksi',
          render: (data: any, type: any, row: any) => {
            const statusPosting = row.statusPosting;
            if (statusPosting !== 'I') {
              return '<span class="text-center text-warning">DATA SUDAH POSTED</span>';
            } else{
              return `<button class="btn btn-sm action-select btn-info btn-80 text-white">Pilih</button>`
            }
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
    this.formData = orderData;
    this.formData.tglPesananan = moment(orderData.tglPesananan, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
    this.formData.tglTransaksi = moment(orderData.tglTransaksi, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/receipt-from-warehouse/display-data-dari-gudang']);
  }

}





