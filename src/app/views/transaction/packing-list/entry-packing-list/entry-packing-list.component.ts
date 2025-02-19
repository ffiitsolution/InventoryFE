import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from '../../../../config/app.config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import {
  ACTION_VIEW,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../../constants';
import { AppService } from '../../../../service/app.service';
import { Page } from '../../../../model/page';
import { data } from 'jquery';

@Component({
  selector: 'app-entry-packing-list',
  templateUrl: './entry-packing-list.component.html',
  styleUrls: ['./entry-packing-list.component.scss'],
})
export class EntryPackingListComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  numericInputRenderer(data: any, type: any, row: any, meta: any) {
    if (type === 'display') {
      return `
        <input type="number" class="form-control text-center"
             value="${data || ''}" 
             min="0" max="99999"
             oninput="this.value = this.value.replace(/[^0-9]/g, ''); 
                      if(this.value.length > 5) this.value = this.value.slice(0, 5);
                      if(this.value > 99999) this.value = 99999;"
             (change)="updateTableData(${meta.row}, '${meta.settings.aoColumns[meta.col].data}', this.value)">
      `;
    }
    return data;
  }

  updateTableData(rowIndex: number, columnName: string, newValue: any) {
    if (!this.reportProposeData[rowIndex]) return;

    this.reportProposeData[rowIndex][columnName] = newValue;

    console.log(
      `Data pada baris ${rowIndex} kolom ${columnName} diperbarui:`,
      newValue
    );
  }
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  dtOptions: DataTables.Settings = {};
  dtOptions_2: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  page = new Page();

  startDate: Date = new Date();
  endDate: Date = new Date();
  minDate: Date = new Date();
  maxDate: Date = new Date();

  loading: boolean = false;
  showFilterSection: boolean = false;
  reportProposeData: any[] = [];
  totalLength: number = 0;

  dateRangeFilter: any = [new Date(), new Date()];
  dataUser: any;
  nomorDoList: any;
  isShowModal: boolean = false;
  selectedRo: any = {};

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private config: AppConfig,
    private appService: AppService
  ) {
    this.minDate.setDate(this.minDate.getDate() - 7);
  }

  ngOnInit(): void {
    this.nomorDoList = JSON.parse(localStorage.getItem('listNoDO') || '[]');
    this.dtOptions = {
      paging: true,
      pageLength: 5,
      lengthMenu: [5],
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getProsesDoBalik(callback);
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
      },
      scrollX: true,
      autoWidth: false,
      columns: [
        { data: 'KODE_BARANG', title: 'Kode Barang', className: 'text-center' },
        { data: 'NAMA_BARANG', title: 'Nama Barang', className: 'text-center' },
        { data: 'KONVERSI', title: 'Konversi', className: 'text-center' },
        {
          data: 'TOTAL_QTY_KIRIM',
          title: 'Qty Kirim',
          className: 'text-center',
        },
        {
          data: 'NO_SURAT_JALAN',
          title: 'No Surat Jalan',
          className: 'text-center',
        },
        { data: 'KODE_TUJUAN', title: 'Kode Tujuan', className: 'text-center' },
        { data: 'NAMA_CABANG', title: 'Nama Cabang', className: 'text-center' },
        {
          data: 'NOMOR_COLLI',
          title: 'Nomor Colli',
          className: 'text-center',
          defaultContent: '',
          render: (data, type, row, meta) => this.numericInputRenderer(data, type, row, meta),
        },
        {
          data: 'JUMLAH_COLLI',
          title: 'Jumlah Colli',
          className: 'text-center',
          defaultContent: '',
          render: (data, type, row, meta) => this.numericInputRenderer(data, type, row, meta),
        },
      ],

      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-posting', row).on('click', () =>
          this.actionBtnClick('POSTING', data)
        );
        return row;
      },
      order: [[2, 'desc']],
    };

    this.dtOptions_2 = {
      paging: true,
      pageLength: 10,
      lengthMenu: [5],
      processing: true,
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeArea: this.g.getUserAreaCode(),
        };
        this.getListGudang(params, callback);
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
      },
      autoWidth: true,
      columns: [
        {
          data: 'kodeCabang',
          title: 'Kode Cabang',
          className: 'text-center',
        },
        {
          data: 'namaCabang',
          title: 'Nama Cabang',
          className: 'text-center',
        },
        {
          data: 'kodeGroup',
          title: 'Group',
          className: 'text-center',
        },
        {
          data: null, // Tidak mengambil langsung dari satu field
          title: 'Alamat', // Nama kolom yang sama untuk keduanya
          className: 'text-center',
          render: function (data, type, row) {
            let alamat1 = row.alamat1 ? row.alamat1 : '-'; // Cek jika null
            let alamat2 = row.alamat2 ? row.alamat2 : '-';
            return `${alamat1} <br> ${alamat2}`;
          },
        },
        { data: 'kota', title: 'Kota', className: 'text-center' },
        // {
        //   data: 'NOMOR_COLLI',
        //   title: 'Nomor Colli',
        //   className: 'text-center',
        //   defaultContent: '',
        //   render: this.numericInputRenderer,
        // },
        // {
        //   data: 'JUMLAH_COLLI',
        //   title: 'Jumlah Colli',
        //   className: 'text-center',
        //   defaultContent: '',
        //   render: this.numericInputRenderer,
        // },
      ],

      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-posting', row).on('click', () =>
          this.actionBtnClick('POSTING', data)
        );
        return row;
      },
      order: [[2, 'desc']],
    };

  }

  actionBtnClick(action: string, data: any): void {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(data)
      );
      this.router.navigate([
        '/transaction/delivery-item/dobalik/detail-report-do-balik',
      ]);
      this;
    }
    if (action === 'POSTING') {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(data)
      );
      const param = {
        kodeGudang: data.KODE_GUDANG,
        noSuratJalan: data.NO_SURAT_JALAN,
        userPosted: JSON.parse(localStorage.getItem('inv_currentUser') || '')
          .namaUser,
      };
      this.appService.updateDeliveryOrderPostingStatus(param).subscribe({
        next: (response) => {
          this.toastr.success('Berhasil Posting DO Balik');
          this.search();
        },
        error: (error) => {
          this.toastr.error('Gagal Posting DO Balik');
        },
      });
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  onShowModal() {
    this.isShowModal = true;
  }
  actionBtnClickInModal(action: string, data: any = null) {
    this.selectedRo = JSON.stringify(data);
    // this.renderDataTables();
    this.isShowModal = false;
    // this.mapOrderData(data);
    // this.onSaveData();
  }

  dtPageChange(event: any): void {}

  search(): void {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getProsesDoBalik(callback: any): void {
    this.loading = true;

    // Format tanggal menjadi 'dd MM yyyy' sebelum dikirim ke backend
    const formattedStartDate = moment(this.startDate).format('DD MMM yyyy');
    const formattedEndDate = moment(this.endDate).format('DD MMM yyyy');

    const parsedDoList = JSON.parse(this.nomorDoList);
    const params = parsedDoList.map((item: any) => {
      return {
        kodeGudang: this.g.getUserLocationCode(),
        noSuratJalan: item.NO_SURAT_JALAN,
      };
    });

    console.log('Mengirim data ke backend:', params);

    this.dataService
      .postData(
        this.config.BASE_URL + '/delivery-order/entry-packing-list',
        params
      )
      .subscribe(
        (response: any) => {
          let index = 0;
          dtIndex: this.page.start + index + 1;
          this.reportProposeData = response.packingList;
          this.totalLength = response.recordsTotal;
          callback({
            recordsTotal: response.recordsTotal,
            recordsFiltered: response.recordsFiltered,
            data: this.reportProposeData,
          });
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
  }

  getListGudang(param: any, callback: any): void {
    this.loading = true;

    // Format tanggal menjadi 'dd MM yyyy' sebelum dikirim ke backend
    const formattedStartDate = moment(this.startDate).format('DD MMM yyyy');
    const formattedEndDate = moment(this.endDate).format('DD MMM yyyy');

    const parsedDoList = JSON.parse(this.nomorDoList);
    const kodeGudangArray = [
      ...new Set(parsedDoList?.map((item: any) => item.KODE_GUDANG)),
    ];

    const params = { kodeArea: this.g.getUserAreaCode() };

    console.log('Mengirim data ke backend:', param);

    this.dataService
      .postData(this.config.BASE_URL + '/delivery-order/get-site-info', param)
      .subscribe(
        (response: any) => {
          console.log('Site info data:', response.data.length);
          let index = 0;
          dtIndex: this.page.start + index + 1;
          this.reportProposeData = response.data;
          this.totalLength = response?.length;
          this.page.recordsTotal = response.data.recordsTotal;
          this.page.recordsFiltered = response.data.recordsFiltered;

          callback({
            recordsTotal: response?.length,
            recordsFiltered: response.data.recordsFiltered,
            data: this.reportProposeData,
          });
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
  }

  toggleFilter() {
    this.showFilterSection = !this.showFilterSection;
  }

  onFilterPressed() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  navigateToDeliveryItem(): void {
    this.router.navigate(['/transaction/delivery-item/add-data']);
  }
}
