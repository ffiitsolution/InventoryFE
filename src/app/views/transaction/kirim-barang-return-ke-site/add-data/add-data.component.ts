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
import {
  ACTION_SELECT,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
  BUTTON_CAPTION_SELECT,
} from '../../../../../constants';
import moment from 'moment';
import { DatePipe } from '@angular/common';
import { HelperService } from 'src/app/service/helper.service';

@Component({
  selector: 'app-add-kirim-barang-return-ke-site',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
  providers: [DatePipe],
})
export class AddKirimBarangReturnKeSiteComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtColumns: any = [];
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRo: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  selectedRowData: any;
  buttonCaptionSelect: string = BUTTON_CAPTION_SELECT;

  @ViewChild('formModal') formModal: any;
  // Form data object
  formData = {
    kodeTujuan: '',
    namaTujuan: '',
    alamatTujuan: '',
    statusTujuan: '',
    keterangan: '',
    tglTransaksi: this.helperService.formatDate(new Date()),
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService,
    private appService: AppService,
    private datePipe: DatePipe,
    private helperService: HelperService
  ) {
    this.dpConfig.containerClass = 'theme-red';
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
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id'
          ? this.translationService.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const requestData = {
          ...dataTablesParameters,
        };
        this.dataService
          .postData(
            this.globalService.urlServer + '/api/branch/dt',
            requestData
          )
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                keteranganRsc: `${rest.kodeRsc} - ${rest.keteranganRsc}`,
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
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'kodeCabang', title: 'Kode', searchable: true },
        { data: 'kodeSingkat', title: 'Inisial', searchable: true },
        { data: 'tipeCabang', title: 'Tipe', searchable: true },
        { data: 'namaCabang', title: 'Nama', searchable: true },
        { data: 'keteranganRsc', title: 'RSC', searchable: true },
        { data: 'kota', title: 'Kota', searchable: true },
        { data: 'telpon1', title: 'Telp', searchable: true },
        { data: 'deskripsiGroup', title: 'Group', searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          render: (data, type, row) => {
            if (row.statusAktif === 'A') {
              return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-select btn-info btn-60 text-white">${this.buttonCaptionSelect}</button>
                </div>
              `;
            }
            return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-select btn-info btn-60 text-white" disabled>${this.buttonCaptionSelect}</button>
                </div>
              `;
          },
        },
      ],
      searchDelay: 1500,
      order: [
        [9, 'asc'],
        [1, 'asc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () => this.actionBtnClick(data));

        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
    // this.formData.namaTujuan
  }

  onAddDetail() {
    this.formData.tglTransaksi =
      moment(this.formData.tglTransaksi, 'YYYY-MM-DD').format('DD-MM-YYYY') ||
      '';

    this.globalService.saveLocalstorage(
      'header_kirim_barang_return_ke_site',
      JSON.stringify(this.formData)
    );
    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return Object.values(this.formData).some((value) => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage('headerWastage');
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/kirim-barang-return-ke-site/list-dt']);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  updateShowDetail(data: any) {
    this.isShowDetail = !this.isShowDetail;
  }

  actionBtnClick(data: any = null) {
    // this.selectedRo = JSON.stringify(data);
    // console.log(data);
    this.formData.kodeTujuan = data?.kodeCabang;
    this.formData.namaTujuan = data?.namaCabang;
    this.formData.alamatTujuan = data?.alamat1;
    this.formData.statusTujuan = data?.statusAktifLabel;
    // this.renderDataTables();
    this.isShowModal = false;
    // this.mapOrderData(data);
    // this.onSaveData();
  }

  formatDate(date: string | Date): string {
    if (typeof date === 'string') {
      return date;
    } else {
      return this.datePipe?.transform(date, 'dd/MM/yyyy') || '';
    }
  }
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
