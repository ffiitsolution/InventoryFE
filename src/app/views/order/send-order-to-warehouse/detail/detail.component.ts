import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_DELIVERY_ORDER,
  OUTLET_BRAND_KFC,
  SEND_PRINT_STATUS_SUDAH,
  STATUS_SAME_CONVERSION,
  ACTION_SELECT,
  LS_INV_SELECTED_SEND_TO_WAREHOUSE_ORDER
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../../config/app.config';

import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import moment from 'moment';

@Component({
  selector: 'detail-send-order-to-warehouse',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailSendOrderToWarehouseComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  newOrhdk: any = (localStorage.getItem('TEMP_ORDHDK') || '{}'  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  listOrderData: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  isShowModal: boolean = false;
  dtOptions: DataTables.Settings = {};
  selectedRow:  any = {};
  pageModal = new Page();
  detailDataSendToWarehouse: any = {};
  detailDataDetailSendToWarehouse: any[] = [];

  @ViewChild('formModal') formModal: any;


  protected config = AppConfig.settings.apiServer;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private dataService: DataService,
    private service: AppService,

  ) {
    this.g.navbarVisibility = true;
    this.newOrhdk = JSON.parse(this.newOrhdk);
    this.getDeliveryItemDetails()
  }

  ngOnInit(): void {
    console.log("newOrhdk",this.newOrhdk)
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );

    const isCanceled = this.newOrhdk.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.newOrhdk.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.renderDataTables();

    this.detailDataSendToWarehouse = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_SEND_TO_WAREHOUSE_ORDER));
    console.log("detailDataSendToWarehouse",this.detailDataSendToWarehouse);

    const params = {
      nomorPesanan: this.detailDataSendToWarehouse?.nomorPesanan
    };
    this.dataService
    .postData(this.g.urlServer + '/api/send-order-to-warehouse/detail-DetailOrder',params)
    .subscribe((resp: any) => {
      this.detailDataDetailSendToWarehouse = resp;
      this.listOrderData = this.detailDataDetailSendToWarehouse.map(item => ({
        totalQtyPesan: item.TOTAL_QTY_PESAN,
        qtyPesanBesar: item.QTY_PESAN_BESAR,
        namaBarang: item.NAMA_BARANG,
        satuanKecil: item.SATUAN_KECIL,
        kodeBarang: item.KODE_BARANG,
        satuanBesar: item.SATUAN_BESAR,
        konversi: item.KONVERSI,
        qtyPesanKecil: item.QTY_PESAN_KECIL
    }));
    });


  

    // this.dataService
    // .getData(this.g.urlServer + '/api/send-order-to-warehouse/detail-header')
    // .subscribe((resp: any) => {
    //   console.log("resp2",resp);
    // });


  }
  

  getDeliveryItemDetails() {
    this.loading = true;
    this.listOrderData = [];

    const params = {
      nomorPesanan: this.newOrhdk.nomorPesanan
    };

  //   this.listOrderData = [
  //     {
  //       totalQtyPesan: 0,
  //       qtyPesanBesar: 5,
  //       namaBarang: "DAGING SAPI SLICE",
  //       satuanKecil: "PCS",
  //       kodeBarang: "02-2001",
  //       satuanBesar: "KG",
  //       konversi: 5,
  //       qtyPesanKecil: 10
  //     }
  // ];
  }

  onInputValueItemDetail(event: any, index: number) {
    const target = event.target;
    const value = target.value;

    if (target.type === 'number') {
      this.listOrderData[index][target.name] = Number(value); 
    } else {
      this.listOrderData[index][target.name] = value;
    }
  }
  onFilterSearch(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    return this.helper.applyFilterList(listData, filterText, startAfter);
  }

  ngAfterViewInit(): void {
  }
  ngOnDestroy(): void {
    this.g.navbarVisibility = true;
  }

  onBackPressed() {
    this.router.navigate(['/transaction/delivery-item/add-data']);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
    console.log(this.listOrderData);

    // param for order Header
    const paramHeader = this.newOrhdk;
    
    console.log("paramHeader:", paramHeader);


    this.service.insert('/api/send-order-to-warehouse/insert-header', paramHeader).subscribe({
      next: (res) => {
        if (!res.success) {
          alert(res.message);
        } else {
          console.log("res header:", res); 
          console.log("res item:", res.item?.[0]?.nomorPesanan ?? "Not found");
          this.newOrhdk.nomorPesanan =  res.item?.[0]?.nomorPesanan ;

          this.insertDetail()
          setTimeout(() => {
            this.onPreviousPressed();
          }, DEFAULT_DELAY_TIME);
          
        }
        this.adding = false;
      },
    });

    // this.service.insert('/api/users', param).subscribe({
    //   next: (res) => {
    //     if (!res.success) {
    //       alert(res.message);
    //     } else {
    //       this.toastr.success('Berhasil!');
    //       setTimeout(() => {
    //         this.onPreviousPressed();
    //       }, DEFAULT_DELAY_TIME);
    //     }
    //     this.adding = false;
    //   },
    // });



  

  
    // const param = this.listOrderData.map((data: any) => ({
    //   kodeGudang: this.newOrhdk.kodeGudang,
    //   kodeTujuan: this.newOrhdk.codeDestination,
    //   tipeTransaksi: '3',
    //   nomorPesanan: this.newOrhdk.nomorPesanan,
    //   kodeBarang: data.kodeBarang, 
    //   qtyBPesan: data.qtyPesanBesar,   
    //   qtyKPesan: data.qtyPesanKecil,   
    //   hargaSatuan: 0, 
    //   userCreate: JSON.parse(localStorage.getItem('inv_currentUser') || '{}').namaUser,
    //   konversi: data.konversi
    // }));
  
    // this.appService.saveDeliveryOrder(param).subscribe({
    //   next: (res) => {
    //     if (!res.success) {
    //       alert(res.message);
    //     } else {
    //       this.toastr.success('Berhasil!');
    //       setTimeout(() => {
    //         this.onBackPressed();
    //       }, DEFAULT_DELAY_TIME);
    //     }
    //     this.adding = false;
    //   },
    //   error: (err) => {
    //     console.error("Error saat insert:", err);
    //   }
    // });
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
        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          defaultGudang: this.newOrhdk?.kodeSingkat,
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        // this.appService.getNewReceivingOrder(params)
        this.dataService
        .postData(this.g.urlServer + '/api/product/dt-pesanan', params)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.pageModal.start + index + 1,
                // kodePemesan: `(${rest.kodeGudang}) ${rest.namaGudang}`,
                // tglPesan: this.g.transformDate(rest.tglPesan),
                // tglKirim: this.g.transformDate(rest.tglKirim),
                // tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
              };
              return finalData;
            });
            this.pageModal.recordsTotal = resp.recordsTotal;
            this.pageModal.recordsFiltered = resp.recordsFiltered;
            // this.showFilterSection = false;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'kodeBarang', title: 'Kode Barang' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        { data: 'flagConversion', title: 'Conversion Factor' },
        { data: 'statusAktif', title: 'Status Aktif' },

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
  actionBtnClick(action: string, data: any = null) {
    this.selectedRow = (data);
    console.log("this.selectedRow:", this.selectedRow);
    this.renderDataTables();
    this.isShowModal = false;
    this.listOrderData.push({
      totalQtyPesan: 0,
      qtyPesanBesar: 0,
      namaBarang:  this.selectedRow?.namaBarang,
      satuanKecil:this.selectedRow?.satuanKecil,
      kodeBarang:this.selectedRow?.kodeBarang,
      satuanBesar: this.selectedRow?.satuanBesar,
      konversi: this.selectedRow?.konversi,
      qtyPesanKecil: 0,
      ...this.selectedRow
  });

  

    // this.mapOrderData(data);
    // this.onSaveData();
  }

  deleteBarang(index:any) {
    this.listOrderData.splice(index, 1);
  }

  insertDetail(){
    // param for order header detail
    const paramDetail = this.listOrderData.map(item => ({
      kodeGudang: this.newOrhdk.kodeGudang,
      kodeTujuan: this.newOrhdk.supplier,
      nomorPesanan: this.newOrhdk.nomorPesanan,
      kodeBarang: item.kodeBarang,
      konversi: item.konversi,
      satuanKecil: item.satuanKecil,
      satuanBesar: item.satuanBesar,
      qtyPesanBesar: item.qtyPesanBesar,
      qtyPesanKecil: item.qtyPesanKecil,
      totalQtyPesan: (this.helper.sanitizedNumber(item.qtyPesanBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyPesanKecil),
      hargaUnit: item.unitPrice
  }));


  this.service.insert('/api/send-order-to-warehouse/insert-detail', paramDetail).subscribe({
    next: (res) => {
      if (!res.success) {
        alert(res.message);
      } else {
        console.log("res detail:", res); 
        
        this.toastr.success('Berhasil!');
        // setTimeout(() => {
        //   this.onPreviousPressed();
        // }, DEFAULT_DELAY_TIME);
        
      }
      this.adding = false;
    },
  });
  

  console.log("Mapped paramDetail:", paramDetail);

  }

  onPreviousPressed(): void {
    this.router.navigate(['order/send-order-to-warehouse']);
  }

}
