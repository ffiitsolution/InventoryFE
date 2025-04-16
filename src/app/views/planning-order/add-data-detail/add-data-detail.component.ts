import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CANCEL_STATUS,
  DEFAULT_DELAY_TIME,
  SEND_PRINT_STATUS_SUDAH,
} from '../../../../constants';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../config/app.config';
import { HelperService } from '../../../service/helper.service';
import { AppService } from '../../../service/app.service';
import moment from 'moment';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { DataService } from '../../../service/data.service';
import { Page } from '../../../model/page';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-add-data-detail-planning-order',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailPlanningOrderComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  orders: any[] = [];
  headerPlanningOrder: any = JSON.parse(localStorage['headerPlanningOrder']);
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: boolean = false;
  totalLength: number = 0;
  listEntryExpired: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  isShowModal: boolean = false;
  dtOptions: DataTables.Settings = {};
  selectedRow: any[] = [];
  pageModal = new Page();
  dataUser: any = {};
  validationMessageList: any[] = [];
  validationMessageQtyPesanList: any[] = [];
  isShowModalExpired: boolean = false;
  isShowModalDelete: boolean = false;
  indexDataDelete: any;
  selectedExpProduct: any = {};
  searchText: string = '';
  loadingSimpan: boolean = false;
  selectedRowData: any;
  @Output() onBatalPressed = new EventEmitter<string>();
  // @Output() jumlahBahanbaku = new EventEmitter<number>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  validationExpiredMessageList: any[] = [];
  totalFilteredExpired: any = '0.0';
  listCurrentPage: number = 1;
  totalLengthList: number = 1;
  @ViewChild('formModal') formModal: any;
  paramGenerateReport = {};
  paramUpdatePrintStatus = {};
  isShowModalReport: boolean = false;
  confirmSelection: string = 'semua';
  downloadURL: any = [];
  loaderCetak: boolean = false;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red my-datepicker-top',
    customTodayClass: 'today-highlight',
    minDate: new Date(),
  };
  protected config = AppConfig.settings.apiServer;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private service: AppService
  ) {
    this.g.navbarVisibility = false;
    this.headerPlanningOrder = JSON.parse(this.headerPlanningOrder);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Production') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerPlanningOrder.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
    this.headerPlanningOrder.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.loadPlanningProduct();
  }

  onFilterSearch(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    return this.helper.applyFilterList(listData, filterText, startAfter);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBackPressed() {
    this.onBatalPressed.emit('');
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.listProductData
          .filter((item) => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map((item) => ({
            kodeGudang: this.g.getUserLocationCode(),
            year: Number(this.headerPlanningOrder.selectedYear),
            month: Number(this.headerPlanningOrder.selectedMonth),
            kodeBarang: item.kodeBarang,
            kirimPeriod1: (item.periode1 * item.konversi).toFixed(2),
            kirimPeriod2: (item.periode2 * item.konversi).toFixed(2),
            kirimPeriod3: (item.periode3 * item.konversi).toFixed(2),
            rataRata: (item.rataRataQty * item.konversi).toFixed(2),
            saldoAwal: item.saldoAwal,
            leadTime:0,
            orderSystem: (item.orderBySystem * item.konversi).toFixed(2),
            orderManual: (item.totalOrder * item.konversi).toFixed(2),
            manual1: (item.week1 * item.konversi).toFixed(2),
            manual2: (item.week2 * item.konversi).toFixed(2),   
            manual3: (item.week3 * item.konversi).toFixed(2),
            manual4: (item.week4 * item.konversi).toFixed(2),  
            isChanged: item.isChanged == 1 ? true : false,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
       
      };

      Swal.fire({
        title: 'Pastikan semua data sudah di input dengan benar!',
        text: '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proses Simpan',
        cancelButtonText: 'Batal Simpan',
      }).then((result) => {
        if (result.isConfirmed) {
          this.service
            .insert('/api/planning-order/insert', param)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                } else {
                  setTimeout(() => {
                    this.toastr.success('Data Planning berhasil disimpan!');
                    // this.onPreviousPressed();
                  }, DEFAULT_DELAY_TIME);
                }
                this.adding = false;
                this.loadingSimpan = false;
              },
              error: () => {
                this.loadingSimpan = false;
              },
            });
        } else {
          this.toastr.info('Simpan dibatalkan');
          this.loadingSimpan = false;
        }
      });
    }
  }

  onShowModal() {
    this.isShowModal = true;
  }

  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }





  isValidQtyExpired: boolean = true;





  onPreviousPressed(): void {
    this.router.navigate(['/transaction/production/list-dt']);
  }

  isDataInvalid() {
    let dataInvalid = false;

   

    const invalidExpired = this.listEntryExpired.filter(
      (item) => item.validationExpiredMessageList !== ''
    );

    
    if (invalidExpired.length > 0) {
      dataInvalid = true;
      this.toastr.error(
        `Data tgl expired tidak sesuai di kode barang ${invalidExpired[0].kodeBarang} !`
      );
    }

    return dataInvalid;
  }

  listProductData: any[] = [
    {
      kodeBarang: '',
      namaBarang: '',
      konversi: '',
      satuanKecil: '',
      satuanBesar: '',
      rataRataQty: '',
      saldoAwal: '',
      minimumStock:0,
      maximumStock:0,
      minimumOrder:0,
      orderBySystem:0,
      week1:'0.00',
      week2:'0.00',
      week3:'0.00',
      week4:'0.00',
      totalOrder:0,
      isConfirmed: false,
      periode1: '0.00',
      periode2: '0.00',
      periode3: '0.00',
      isChanged: false,
    },
  ];
  tempKodeBarang: string = '';

  loadPlanningProduct() {

    this.loading = true;
    let param = {
      yearEom: Number(this.headerPlanningOrder.selectedYear),
      monthEom: Number(this.headerPlanningOrder.selectedMonth),
      kodeGudang: this.g.getUserLocationCode(),
    }
    
    this.appService.generatePlanningOrder(param).subscribe({
      next: (res) => {
        this.loading = false;
        this.totalLengthList = res.data.length;
      

        this.listProductData = res.data.map((item: any) => {
          const avgQty = item.avgQty / item.konversi;
          const bufferStock = parseFloat(this.headerPlanningOrder.bufferStock); // Assuming bufferStock is a percentage (e.g., 10 for 10%)
          const orderBySystem = avgQty + (avgQty * bufferStock / 100);

          return {
            kodeBarang: item.kodeBarang,
            namaBarang: item.namaBarang,
            konversi: parseFloat(item.konversi).toFixed(2),
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            rataRataQty:  (avgQty).toFixed(2),
            saldoAwal: parseFloat(item.saldoAwal).toFixed(2),
            minimumStock: parseFloat(item.minStock).toFixed(2),
            maximumStock: parseFloat(item.maxStock).toFixed(2),
            minimumOrder: parseFloat(item.minOrder).toFixed(2),
            orderBySystem: orderBySystem.toFixed(2),
            week1: (item.manual1/ item.konversi).toFixed(2),
            week2: (item.manual2/ item.konversi).toFixed(2),
            week3: (item.manual3/ item.konversi).toFixed(2),
            week4: (item.manual4/ item.konversi).toFixed(2),
            totalOrder: (item.orderManual/ item.konversi).toFixed(2),
            periode1: (item.periode1/ item.konversi).toFixed(2),
            periode2: (item.periode2/ item.konversi).toFixed(2), 
            periode3: (item.periode3/ item.konversi).toFixed(2),
            isChanged: item.isChanged,
          }
        });
        this.loading = false;
        this.selectedRowData = this.listProductData[0];
      },
    });
  }

 

  

  
  
  onInputValueItemDetail(
    event: any,
    index: number,
    type:number = 1
  ) {


      index = index + ((this.listCurrentPage-1) * 5);
      let value = event.target.value;
      console.log("masuk om",value)
      console.log("masuk om2",index)

      if (value !== null && value !== undefined) {
        let numericValue = parseFloat(value.toString().replace(',', '.'));
        if (isNaN(numericValue)) {
            numericValue = 0;
        }
        value = Math.abs(numericValue).toFixed(2);
      } else {
        value = "0.00"; // Default if empty
      }

      if(value <= 0){
        this.validationMessageList[index] = "Quantity tidak boleh <= 0"
      }else{
        this.validationMessageList[index] ="";
      }

      if(type == 1){
        this.filteredData[index].week1 = value;
      }else if(type == 2){    
        this.filteredData[index].week2 = value;
      }else if(type == 3){        
        this.filteredData[index].week3 = value;
      }else if(type == 4){      
        this.filteredData[index].week4 = value;
      }

      this.filteredData[index].totalOrder = parseFloat((
        (Number(this.filteredData[index].week1) || 0) +
        (Number(this.filteredData[index].week2) || 0) +
        (Number(this.filteredData[index].week3) || 0) +
        (Number(this.filteredData[index].week4) || 0)
      ).toFixed(2)).toFixed(2);

      this.filteredData[index].isChanged = true;
      
  }

  get filteredData() {
    const filtered = !this.searchText
      ? this.listProductData
      : this.listProductData.filter(item =>
          item.namaBarang?.toLowerCase().includes(this.searchText.toLowerCase()) ||
          item.konversi?.toString().includes(this.searchText) ||
          item.kodeBarang?.toString().includes(this.searchText)
        );
  
    // Default sort by kodeBarang ascending
    return filtered.sort((a, b) =>
      a.kodeBarang?.localeCompare(b.kodeBarang)
    );
  }
  
  
  onRowClicked(data: any) {
    this.selectedRowData = data;
    console.log('Selected Row Data:', this.selectedRowData);
  }

  doCetak() {
    this.loaderCetak = true;
    let param = {
      year: Number(this.headerPlanningOrder.selectedYear),
      month: Number(this.headerPlanningOrder.selectedMonth),
      tipedata: this.confirmSelection,
      kodeGudang: this.g.getUserLocationCode(),
    };
    this.service.getFile('/api/report/planning-order', param).subscribe({
      next: (res) => {
        this.loaderCetak = false;
        return this.downloadCsv(res);
      },
      error: (error) => {
        this.loaderCetak = false;
      },
    });
  }

  downloadCsv(res: any) {
    var blob = new Blob([res], { type: 'text/csv' });
    this.downloadURL = window.URL.createObjectURL(blob);

    if (this.downloadURL.length) {
      var link = document.createElement('a');
      link.href = this.downloadURL;
      link.download = `ORDER${this.headerPlanningOrder.selectedYear}${this.headerPlanningOrder.selectedMonth}.csv`;
      link.click();
      this.toastr.success('Berhasil Dicetak!');
      this.isShowModalReport =false;
    } else
      this.g.alertError('Maaf, Ada kesalahan!', 'File tidak dapat terunduh.');
  }
}
