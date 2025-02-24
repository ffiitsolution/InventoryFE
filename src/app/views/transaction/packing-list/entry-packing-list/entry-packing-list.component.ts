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
  ACTION_SELECT,
  ACTION_VIEW,
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
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
  implements OnInit, AfterViewInit, OnDestroy {
  numericInputRenderer(data: any, type: any, row: any, meta: any) {
    if (type === 'display') {
      return `
        <input type="number" class="form-control text-center"
               value="${data || ''}" 
               min="0" max="99999"
               oninput="this.value = this.value.replace(/[^0-9]/g, ''); 
                        if(this.value.length > 5) this.value = this.value.slice(0, 5);
                        if(this.value > 99999) this.value = 99999;">
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
  isShowPrintModal: boolean = false;
  selectedRo: any = {};
  selectedData: any;

  searchDetail = '';
  filteredEntryPL: any[] = [];
  listEntryPl: any[] = [];
  listCurrentPage: number = 1;
  totalLengthList: number = 1;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    public router: Router,
    private toastr: ToastrService,
    private config: AppConfig,
    private appService: AppService
  ) {
    this.dtOptions_2 = {
      paging: true,
      pageLength: 10,
      lengthMenu: [5],
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start || 0; // Pastikan tidak NaN
        this.page.length = dataTablesParameters.length || 10; // Pastikan tidak NaN

        const params = {
          ...dataTablesParameters,
          kodeArea: this.g.getUserAreaCode(),
        };
        setTimeout(() => {
          this.getListGudang(params, callback);
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        {
          data: 'kodeCabang',
          title: 'Kode Cabang',
          className: 'text-center',
          searchable: true
        },
        {
          data: 'namaCabang',
          title: 'Nama Cabang',
          className: 'text-center',
          searchable: true
        },
        {
          data: 'kodeGroup',
          title: 'Group',
          className: 'text-center',
        },
        {
          data: null,
          title: 'Alamat',
          className: 'text-center',
          searchable: true,
          render: function (data, type, row) {
            let alamat1 = row.alamat1 ? row.alamat1 : '-';
            let alamat2 = row.alamat2 ? row.alamat2 : '-';
            return `${alamat1} <br> ${alamat2}`;
          },
        },
        { data: 'kota', title: 'Kota', className: 'text-center' },
        {
          data: null,
          title: 'Pilih',
          className: 'text-center',
          orderable: false,
          render: function (data, type, row) {
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white pilih-btn" 
                      data-kodeCabang="${row.kodeCabang}"
                      data-namaCabang="${row.namaCabang}"
                      data-kodeGroup="${row.kodeGroup}"
                      data-alamat1="${row.alamat1}"
                      data-alamat2="${row.alamat2}"
                      data-kota="${row.kota}">
                      Pilih
                    </button>`;
          },
        },
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        $('.pilih-btn', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        return row;
      },
      order: [[1, 'asc']],
    };

    this.minDate.setDate(this.minDate.getDate() - 7);

  }

  ngOnInit(): void {
    this.nomorDoList = JSON.parse(localStorage.getItem('listNoDO') || '[]');
    this.getProsesDoBalik();
  }

  actionBtnClick(action: string, data: any): void {
    if (action === ACTION_SELECT) {
      const paramTujuan = {
        tujuan: data.kodeCabang + ' - ' + data.namaCabang,
        alamatTujuan: data.alamat1 + ',' + data.alamat2 + ',' + data.kota + ' ' + data.kodePos
      }
      this.selectedData = {
        ...this.selectedData,
        kodeCabang: data.kodeCabang,
        namaCabang: data.namaCabang,
        kodeGroup: data.kodeGroup,
        alamat1: data.alamat1,
        alamat2: data.alamat2,
        kota: data.kota};
      this.isShowPrintModal = true;
      this.isShowModal = false;
      // this.onSubmit(paramTujuan);
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
    this.isShowModal = false;
    this.isShowPrintModal = true;
  }

  dtPageChange(event: any): void { }

  search(): void {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getProsesDoBalik(): void {
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
          this.listEntryPl = response.packingList;
          this.listEntryPl.forEach((item: any) => {
            item.nomorColli = '';
            item.jumlahColli = '';
          });


          this.filteredEntryPL = this.listEntryPl;
          this.totalLength = response.recordsTotal;
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
    this.dataService
      .postData(this.config.BASE_URL + '/delivery-order/generate', params[0])
      .subscribe((response: any) => {
        this.selectedData = {
          packingListNumber: response.packingListNumber,
        };
      });
  }

  getListGudang(param: any, callback: any): void {
    this.loading = true;

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



  onSearchDetail(event: any) {
    this.searchDetail = event?.target?.value;
    if (event?.target?.value) {
      this.filteredEntryPL = this.listEntryPl.filter(
        (value: any) =>
          Object.values(value).some(
            (columnValue) =>
              typeof columnValue === 'string' &&
              columnValue
                .toLowerCase()
                .includes(this.searchDetail.toLowerCase())
          ) ||
          (value.items &&
            Array.isArray(value.items) &&
            value.items.some((item: any) =>
              Object.values(item).some(
                (nestedValue: any) =>
                  typeof nestedValue === 'string' &&
                  nestedValue
                    .toLowerCase()
                    .includes(this.searchDetail.toLowerCase())
              )
            ))
      );
    } else {
      this.filteredEntryPL = JSON.parse(
        JSON.stringify(this.listEntryPl)
      );
    }
  }

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    const target = event.target;
    const value = target.value;

    if (this.listEntryPl[index]) {
      this.listEntryPl[index][target.name] = value;
    }
  }

  onSubmit(tujuanReport: any) {

    const params = this.listEntryPl.map((data: any) => {
      return {
        ...data,
        nomorColli: parseInt(data.nomorColli, 10) || 0,
        jumlahColli: parseInt(data.jumlahColli, 10) || 0,
        tujuanReport: tujuanReport
      }
    })

    this.dataService
      .postData(this.config.BASE_URL + '/delivery-order/get-site-info', params)
      .subscribe(
        (response: any) => {
          if (!response.success) {
            alert(response.message);
          } else {
            this.toastr.success("Berhasil!");
            setTimeout(() => {
              this.router.navigate(["/transaction/packing-list"]);
            }, DEFAULT_DELAY_TIME);
          }
        })
  }

  openModal(): void {
    this.isShowModal = true;
  }

  closeModal(): void {
    this.isShowModal = false;
    this.isShowPrintModal = false;
  }

  onCetakPdf(): void {
    console.log('Cetak PDF');
    // Implement your PDF printing logic here
  }

  onCetakPrinter(): void {
    console.log('Cetak Printer');
    // Implement your printer printing logic here
  }
  onPilihCabang(): void {
    this.isShowPrintModal = false;
    this.isShowModal = true;
  }
}
