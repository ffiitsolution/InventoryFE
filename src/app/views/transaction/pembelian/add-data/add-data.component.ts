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
  @ViewChild('formModal') formModal: any;
  // Form data object
  formData: any = {
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService,
    private appService: AppService
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

  onAddDetail() {
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
    this.router.navigate(['/transaction/delivery-item']);
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
        { data: 'tglPesanan', title: 'Tgl. Pesan' },
        { data: 'tglKirimBrg', title: 'Tgl. Kirim' },
        { data: 'tglBatalExp', title: 'Tgl. Expired' },
        { data: 'supplier', title: 'Supplier', },
        { data: 'namaSupplier', title: 'Nama Supplier', },
        { data: 'alamatSupplier', title: 'Alamat', },
        {
          data: 'statusPesanan',
          title: 'Status Pesanan',
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
  }

  handleEnter(event: any) {

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









