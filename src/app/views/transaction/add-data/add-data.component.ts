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

  @ViewChild('formModal') formModal: any;
  // Form data object
  formData = {
    nomorPesanan: '',
    deliveryStatus: '',
    namaCabang: '',
    alamat1: '',
    tglPesan: '',
    tglBrgDikirim: '',
    tglKadaluarsa: '',
    validatedDeliveryDate: '',
    notes: '',
    codeDestination: ''
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

  onAddDetail(){
    this.router.navigate(['/transaction/delivery-item/add-data-detail']);
    this.formData.validatedDeliveryDate = moment(
      this.formData.validatedDeliveryDate, 
      'YYYY-MM-DD'
    ).format('DD-MM-YYYY')
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


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/delivery-item']);
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
      drawCallback: () => { },
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
                // kodePemesan: `(${rest.kodeGudang}) ${rest.namaGudang}`,
                // tglPesan: this.g.transformDate(rest.tglPesan),
                // tglKirim: this.g.transformDate(rest.tglKirim),
                // tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
              };
              return finalData;
            });
            this.page.recordsTotal = resp.recordsTotal;
            this.page.recordsFiltered = resp.recordsFiltered;
            // this.showFilterSection = false;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        // { data: 'dtIndex', title: '#' },
        { data: 'kodeGudang', title: 'Kode Gudang' },
        { data: 'kodePemesan', title: 'Kode Pemesan' },
        { data: 'nomorPesanan', title: 'Nomor Pesanan' },
        { data: 'tglPesan', title: 'Tanggal Pesan' },
        { data: 'tglBrgDikirim', title: 'Tanggal Dikirim', },
        { data: 'keterangan1', title: 'Keterangan', },
        {
          data: 'statusRecieve',
          title: 'Status Penerimaan',
          render: (data) => {
            const isCancel = data == CANCEL_STATUS;
            const label = this.globalService.getsatusDeliveryOrderLabel(data);
            if (isCancel) {
              return `<span class="text-center text-danger">${label}</span>`;
            }
            return label;
          },
        },
        {
          data: 'statusCetak',
          title: 'Status Cetak',
          render: (data) => this.globalService.getsatusDeliveryOrderLabel(data, true),
        },
        {
          title: 'Action',
          render: () => {
            return `<button class="btn btn-sm action-select btn-outline-info btn-60">Pilih</button>`;
          },
        },

      ],
      searchDelay: 1000,
      // delivery: [],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        return row;
      },
    };
  }

  private mapOrderData(orderData: any): void {
    this.formData.deliveryStatus =  'Aktif';
    this.formData.codeDestination = orderData.kodeGudang
    this.formData.namaCabang = orderData.namaCabang || '';
    this.formData.alamat1 = orderData.alamat1 || '';
    this.formData.tglPesan = orderData.tglPesan || '';
    this.formData.tglBrgDikirim = orderData.tglBrgDikirim || '';
    this.formData.tglKadaluarsa = orderData.tglKadaluarsa || '';
    this.formData.notes = orderData.keterangan1 || '';
    this.formData.nomorPesanan = orderData.nomorPesanan || '';
    this.formData.validatedDeliveryDate = orderData.tglPesan || '';

    this.maxDate = new Date(this.formData.tglKadaluarsa);
  }

}
@Injectable({
  providedIn: 'root',
})
export class DeliveryDataService {
  constructor(private http: HttpClient) { }

  saveDeliveryData(data: any): Observable<any> {
    const apiUrl = 'http://localhost:8093/inventory/api/delivery-order/status-descriptions';
    return this.http.post<any>(apiUrl, data);
  }
}









