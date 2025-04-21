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

@Component({
  selector: 'app-add-penjualan-brg-bekas',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],

})
export class AddDataPenjualanBrgBekasComponent implements OnInit, AfterViewInit, OnDestroy {
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedSupplier: any = {};
  minDate: Date;
  maxDate: Date;
  selectedSupplierData: any;
  isShowDetail: boolean = false;
  configSelectUser: any;
  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => { }, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name' // Key to search
  };

  selectedRowData: any;

  listUser: any[] = [];
  @ViewChild('formModal') formModal: any;
  // Form data object
  formData = {
    namaSaksi: '',
    jabatanSaksi: '',
    keterangan: '',
    tglTransaksi: moment(new Date(), 'YYYY-MM-DD').format('DD-MM-YYYY') || '',
    supplier: '',
    namaSupplier: '',
    alamatSupplier: '',
    statusAktif: '',
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
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
    this.dpConfig.customTodayClass = 'today-highlight';

    const today = new Date().toISOString().split('T')[0];
    this.minDate = new Date(today);

    this.getDropdownUser();
    this.configSelectUser = {
      ...this.baseConfig,
      placeholder: 'Pilih user',
      searchPlaceholder: 'Cari user',
      limitTo: this.listUser.length
    };
    this.renderDataTables()
  }

  getDropdownUser(): void {
    const param = {
      defaultLocation: this.globalService.getUserLocationCode()
    };
    this.dataService
      .postData(this.globalService.urlServer + '/api/dropdown-user', param)
      .subscribe((resp: any) => {
        this.listUser = resp.map((item: any) => ({
          name: item.namaUser,
          jabatan: item.jabatan
        }));
      });
  }

  onUserChange(event: any) {
    const value = event.value;
    this.formData.namaSaksi = value.name;
    this.formData.jabatanSaksi = value.jabatan;
  }

  onAddDetail() {
    this.formData.tglTransaksi = moment(this.formData.tglTransaksi, 'DD-MM-YYYY').format('DD-MM-YYYY');

    this.globalService.saveLocalstorage(
      'headerData',
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
    // this.globalService.removeLocalstorage(
    //   'headerData',
    // );
  }


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/penjualan-barang-bekas/list']);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  handleEnter(event: any) {

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
        this.selectedSupplierData = undefined;
      },
      order: [[2, 'desc']],
      pageLength: 5,
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters
        };
        this.appService.getSupplier(params)
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
        { data: 'kodeSupplier', title: 'Kode Supplier', searchable: true, orderable: true },
        { data: 'namaSupplier', title: 'Nama Supplier', searchable: true, orderable: true },
        { data: 'alamat1', title: 'Alamat Supplier', searchable: true, orderable: true },
        { data: 'kota', title: 'Kota', searchable: true, orderable: true },
        {
          data: 'statusAktif', title: 'Status',
          render: (data) => this.globalService.getStatusAktifLabel(data)
        },
        {
          title: 'Action',
          render: (data: any, type: any, row: any) => {

            return `<button class="btn btn-sm action-select btn-info btn-80 text-white">Pilih</button>`
          },
        }
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        if (index === 0 && !this.selectedSupplierData) {
          setTimeout(() => {
            $(row).trigger('td');
          }, 0);
        }
        $('td', row).on('click', () => {
          $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
          if (this.selectedSupplierData !== data) {
            this.selectedSupplierData = data;
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
          } else {
            this.selectedSupplierData = undefined;
          }
        });


        return row;

      },
    };
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedSupplier = JSON.stringify(data);
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
    this.isShowModal = false;
  }

  private mapOrderData(orderData: any): void {
    this.formData.supplier = orderData.kodeSupplier
    this.formData.namaSupplier = orderData.namaSupplier || '';
    this.formData.alamatSupplier = orderData.alamat1 || '';
    this.formData.statusAktif = 'Aktif';
  }
}










