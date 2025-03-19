import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  CANCEL_STATUS,
  DEFAULT_DELAY_TIME,
  SEND_PRINT_STATUS_SUDAH,
} from '../../../../../constants';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../../config/app.config';
import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import moment from 'moment';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { DataService } from '../../../../service/data.service';
import { Page } from '../../../../model/page';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-data-detail-production',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailProductionComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  headerProduction: any = JSON.parse(
    localStorage['headerProduction']
  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  // listProductData: any[] = [];
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
  @Output() onBatalPressed = new EventEmitter<string>();
  @Output() jumlahBahanbaku  = new EventEmitter<number>();
  
  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
  };
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
    this.g.navbarVisibility = false;
    this.headerProduction = JSON.parse(this.headerProduction);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Production') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerProduction.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
    this.headerProduction.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.loadBahanBaku();

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
    this.onBatalPressed.emit('');
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      // param for order Header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.headerProduction.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"),
        statusPosting: 'P',
        keterangan: this.headerProduction.keterangan,
        kodeResep: this.headerProduction.kodeBarang,
        tglExp:moment(this.headerProduction.tglExp, "DD-MM-YYYY").format("D MMM YYYY"),
        jumlahResep:this.headerProduction.jumlahHasilProduksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.listProductData
          .filter(item => item.bahanBaku && item.bahanBaku.trim() !== '')
          .map(item => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(this.headerProduction.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"),
            tipeTransaksi: 12,
            kodeBarang: item.bahanBaku,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyPemakaianBesar || 0,
            qtyKecil: item.qtyPemakaianKecil || 0,
            flagExpired: 'Y',
            totalQty: (this.helper.sanitizedNumber(item.qtyPemakaianBesar) *
              item.konversi) + this.helper.sanitizedNumber(item.qtyPemakaianKecil),
            totalQtyExpired: (this.helper.sanitizedNumber(this.getExpiredData(item.bahanBaku).qtyPemakaianBesar) *
              item.konversi) + this.helper.sanitizedNumber(this.getExpiredData(item.bahanBaku).qtyPemakaianKecil),
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
        detailsExpired: this.listEntryExpired?.map(expiredItem => ({
          kodeGudang: this.g.getUserLocationCode(),
          tglTransaksi: moment(this.headerProduction.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"),
          tipeTransaksi: 12,
          kodeBarang: expiredItem.kodeBarang,
          tglExpired: moment(expiredItem.tglExpired, "DD-MM-YYYY").format("D MMM YYYY"),
          konversi: expiredItem.konversi,
          qtyBesar: -Math.abs(parseInt(expiredItem.qtyPemakaianBesar)) || 0,
          qtyKecil: -Math.abs(parseInt(expiredItem.qtyPemakaianKecil)) || 0,
          totalQty: expiredItem.totalQty ? -Math.abs(expiredItem.totalQty) : 0
        })) || []
      };

      Swal.fire({
            title: 'Pastikan semua data sudah di input dengan benar!',
            text: 'DATA YANG SUDAH DIPOSTING TIDAK DAPAT DIPERBAIKI..!!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Proses Posting',
            cancelButtonText: 'Batal Posting',
          }).then((result) => {
            if (result.isConfirmed) {
              this.service.insert('/api/production/insert', param).subscribe({
                next: (res) => {
                  if (!res.success) {
                    this.toastr.error(res.message);
                  } else {
                    setTimeout(() => {
                      this.toastr.success("Data production berhasil diposting!");
                      this.onPreviousPressed();
                    }, DEFAULT_DELAY_TIME);
        
                  }
                  this.adding = false;
                },
              });
            } else {
              this.toastr.info('Posting dibatalkan');
            }
          });

    }

    else {
      this.toastr.error("Data Qty Pemakaian harus sama dengan Qty Expired");
    }

  }

  onShowModal() {
    this.isShowModal = true;
  }

  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listProductData[index];
    let totalQtySum = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianKecil);

    if (!this.listEntryExpired.some(item => item.kodeBarang === this.selectedExpProduct.bahanBaku)) {
      this.listEntryExpired.push({
        tglExpired: new Date(),
        keteranganTanggal: moment(new Date()).locale('id').format('D MMMM YYYY'),
        qtyPemakaianBesar: this.selectedExpProduct.qtyPemakaianBesar,
        qtyPemakaianKecil: this.selectedExpProduct.qtyPemakaianKecil,
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: this.selectedExpProduct.konversi,
        totalQty: totalQtySum,
        kodeBarang: this.selectedExpProduct.bahanBaku
      })
    }

    this.isShowModalExpired = true;
  }

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyPemakaianBesar: 0,
      qtyPemakaianKecil: 0,
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: this.selectedExpProduct.konversi,
      totalQty: '',
      kodeBarang: this.selectedExpProduct.bahanBaku
    })
  }

  updateKeteranganTanggal(item: any) {
    item.keteranganTanggal = moment(item.tglExpired).locale('id').format('D MMMM YYYY');
  }

  isValidQtyExpired: boolean = true;

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyPemakaian = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty = (this.helper.sanitizedNumber(item.qtyPemakaianBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyPemakaianKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });


    if (totalQtyExpired > totalQtyPemakaian) {
      this.toastr.error("Total Qty Expired harus sama dengan Qty Pemakaian");
    } else {
      this.isShowModalExpired = false;
    }
  }


  get filteredList() {
    return this.listEntryExpired.filter(item => item.kodeBarang === this.selectedExpProduct.bahanBaku);
  }




  onPreviousPressed(): void {
    this.router.navigate(['/transaction/production/list-dt']);
  }

  isDataInvalid() {
    let dataInvalid = false;

    const invalidItems = this.listProductData.filter(
      item => item.totalQtyPemakaian !== 
      this.getTotalExpiredData(item.bahanBaku,item.konversi)
      &&
      item.isConfirmed === true
     )

    if (invalidItems.length > 0) dataInvalid = true;
     
    return dataInvalid
  }

  listProductData: any[] = [
    { bahanBaku: '', namaBarang: '', konversi: '', satuanKecil: '', satuanBesar: '', qtyWasteBesar: '', qtyWasteKecil: '', isConfirmed: false }
  ];
  tempKodeBarang: string = '';

  
  loadBahanBaku() {
      let param = this.headerProduction?.kodeBarang;
     
      this.appService.getBahanBakuByResep(param).subscribe({
        next: (res) => {
            this.listProductData = res.data.map((item: any) => ({
              jumlahHasilProduksi: this.headerProduction.jumlahHasilProduksi,
              bahanBaku: item.bahanBaku,
              namaBarang: item.namaBarang,
              konversi: item.konversi,
              qtyPemakaian: item.qtyPemakaian,
              satuanKecil: item.satuanKecil,
              satuanBesar: item.satuanBesar,
              qtyPemakaianBesar: Math.floor((item.qtyPemakaian*this.headerProduction.jumlahHasilProduksi) / item.konversi).toFixed(0),
              qtyPemakaianKecil: (( item.qtyPemakaian*this.headerProduction.jumlahHasilProduksi)-(Math.floor((item.qtyPemakaian*this.headerProduction.jumlahHasilProduksi) / item.konversi)*item.konversi)).toFixed(2),
              totalQtyPemakaian: (item.qtyPemakaian*this.headerProduction.jumlahHasilProduksi).toFixed(2),
              isConfirmed: item.flagExpired == 'Y' ? true : false
            }));

            this.jumlahBahanbaku.emit(this.listProductData.length);
        },
      });
    
  }

  getExpiredData(kodeBarang: string) {
    const filtered = this.listEntryExpired.filter(item => item.kodeBarang === kodeBarang);
   
    const totalExpired = filtered.reduce((acc, item) => {
      acc.qtyPemakaianBesar += Number(item.qtyPemakaianBesar) || 0;
      acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
      return acc;
    }, { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 });
    
    return totalExpired;
    
  }


  getTotalExpiredData(kodeBarang: string, konversi: number) {
    const filtered = this.listEntryExpired.filter(item => item.kodeBarang === kodeBarang);
    
    const totalExpired = filtered.reduce((acc, item) => {
      acc.qtyPemakaianBesar += (Number(item.qtyPemakaianBesar) || 0) * konversi;  // Multiply qtyPemakaianBesar by konversi
      acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
      return acc;
    }, { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 });
  
    return (totalExpired.qtyPemakaianBesar + totalExpired.qtyPemakaianKecil).toFixed(2);
  }

  onModalDeleteRow(index: number) {
    // Remove item at the specified index
    this.listEntryExpired.splice(index, 1);
  }
  



}    