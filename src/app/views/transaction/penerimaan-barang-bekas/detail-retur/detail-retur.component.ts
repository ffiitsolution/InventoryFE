import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';

import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  SEND_PRINT_STATUS_SUDAH,
} from 'src/constants';
import { AppConfig } from 'src/app/config/app.config';
import moment from 'moment';
import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
@Component({
  selector: 'app-detail-penerimaan-brg-bks-retur',
  templateUrl: './detail-retur.component.html',
  styleUrl: './detail-retur.component.scss',
})
export class DetailPenerimaanBrgBksReturComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  page = new Page();

  orders: any[] = [];
  dtColumns: any = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedPenerimaanBrgBks: any = JSON.parse(
    localStorage['selectedPenerimaanBrgBks']
  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: boolean = false;
  totalLength: number = 0;
  buttonCaptionView: String = 'Lihat';
  paramGenerateReport = {};
  paramUpdatePrintStatus = {};
  countDetail: number = 0;
  public loading: boolean = false;
  protected config = AppConfig.settings.apiServer;
  totalData: any = '0.0';
  validationExpiredMessageList: any[] = [];
  validationMessageList: any[] = [];
  isShowModal: boolean = false;
  currentSelectedForModal: number;
  @Output() jumlahItem = new EventEmitter<number>();
  loadingSimpan: boolean = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  listProductData: any[] = [
    {
      kodeBarang: '',
      namaBarang: '',
      konversi: '',
      satuanKecil: '',
      satuanBesar: '',
      qtyWasteBesar: '',
      qtyWasteKecil: '',
      totalQty: '0.00',
      isFromRetur: false,
    },
  ];

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    public helper: HelperService,
    private appService: AppService,
  ) {
    this.g.navbarVisibility = true;
    this.selectedPenerimaanBrgBks = JSON.parse(this.selectedPenerimaanBrgBks);
    (this.selectedPenerimaanBrgBks.tglPesanan = this.g.transformDate(
      this.selectedPenerimaanBrgBks.tglPesanan
    )),
      (this.selectedPenerimaanBrgBks.tglTransaksi = this.g.transformDate(
        this.selectedPenerimaanBrgBks.tglTransaksi
      )),
      (this.selectedPenerimaanBrgBks.konversi = parseFloat(
        this.selectedPenerimaanBrgBks.konversi
      ).toFixed(2)),
      (this.selectedPenerimaanBrgBks.jumlahResep = parseFloat(
        this.selectedPenerimaanBrgBks.jumlahResep
      ).toFixed(2)),
      (this.selectedPenerimaanBrgBks.totalProduksi = parseFloat(
        this.selectedPenerimaanBrgBks.totalProduksi
      ).toFixed(2));
  }
  reloadTable() {
    setTimeout(() => {
      this.datatableElement?.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }, DEFAULT_DELAY_TABLE);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Penerimaan Barang Bekas') +
        ' - ' +
        this.g.tabTitle
    );
    const isCanceled =
      this.selectedPenerimaanBrgBks.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedPenerimaanBrgBks.cetakSuratJalan == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.loadDataPenerimaan();
  }
  actionBtnClick(action: string, data: any = null) {}

  dtPageChange(event: any) {}

  ngAfterViewInit(): void {
    this.rerenderDatatable();
  }

  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index: any) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('selectedWastage');
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onBackPressed() {
    this.router.navigate(['/transaction/penerimaan-barang-bekas/list-retur']);
  }

  getPrintStatus() {
    if (this.selectedPenerimaanBrgBks.statusCetak != SEND_PRINT_STATUS_SUDAH) {
      return 'Belum';
    }
    return 'Sudah';
  }

  loadDataPenerimaan() {
    let param = { returnNo: this.selectedPenerimaanBrgBks?.returnNo };

    this.dataService
      .postData(
        this.config.BASE_URL_HQ + '/api/return-order/list-detail',
        param
      )
      .subscribe({
        next: (res) => {
          if (!res || !res.item) {
            console.error('Response dari API tidak valid:', res);
            return;
          }

          if (res.item.length == 0) {
            return;
          }

          this.listProductData = res.item
            .filter((item: any) => item.flagBrgBekas === 'Y') // ⬅️ only items with flagBrgBekas === 'Y'
            .map((item: any) => ({
              kodeBarang: item.itemCode,
              namaBarang: item.namaBarang,
              konversi: parseFloat(item.konversi).toFixed(2),
              qtyPemakaian: parseFloat(item.totalQty).toFixed(2),
              satuanKecil: item.uomWhKcl,
              satuanBesar: item.uomWhBsr,
              qtyWasteBesar: parseFloat(item.qtyBsr).toFixed(2),
              qtyWasteKecil: parseFloat(item.qtyKcl).toFixed(2),
              totalQty: parseFloat(item.totalQty).toFixed(2),
              isFromRetur: true,
            }));

          if (this.listProductData.length == 0) {
            this.toastr.error(
              `Data barang bekas tidak ditemukan di No Retur tersebut!`
            );
            this.onBackPressed();
          }
        },
        error: (err) => {
          console.error('Terjadi kesalahan saat memanggil API:', err);
        },
      });
  }

  onInputQtyBesar(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value = Math.abs(numericValue).toFixed(2);
    } else {
      value = '0.00'; // Default if empty
    }

    if (value <= 0) {
      this.validationMessageList[index] = 'Quantity tidak boleh <= 0';
    } else {
      this.validationMessageList[index] = '';
    }

    this.listProductData[index].qtyWasteBesar = value;
    this.listProductData[index].totalQty = (
      Number(value) * Number(this.listProductData[index].konversi) +
      Number(this.listProductData[index].qtyWasteKecil)
    ).toFixed(2);
    this.updateTotalQty();
  }

  onInputQtyKecil(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value = Math.abs(numericValue).toFixed(2);
    } else {
      value = '0.00'; // Default if empty
    }

    if (value <= 0) {
      this.validationMessageList[index] = 'Quantity tidak boleh <= 0';
    } else {
      this.validationMessageList[index] = '';
    }

    if (Math.round(value) >= Math.round(this.listProductData[index].konversi)) {
      this.validationMessageList[index] =
        'Quantity kecil tidak boleh >= konversi';

      this.toastr.error('Quantity kecil tidak boleh >= konversi');
      value = '0.00';
    }

    this.listProductData[index].qtyWasteKecil = value;

    this.listProductData[index].totalQty = (
      Number(this.listProductData[index].qtyWasteBesar) *
        Number(this.listProductData[index].konversi) +
      Number(value)
    ).toFixed(2);
    this.updateTotalQty();
  }

  updateTotalQty() {
    this.totalData = this.listProductData.reduce(
      (sum, data) =>
        Number(sum) +
        Number(
          Number(data.qtyWasteBesar) * Number(data.konversi) +
            Number(data.qtyWasteKecil)
        ),
      0
    );

    this.totalData = parseFloat(this.totalData).toFixed(2);
  }

  onDeleteRow(index: number, data: any) {
    this.listProductData.splice(index, 1);
    this.jumlahItem.emit(this.listProductData.length);
  }

  handleEnter(event: any, index: number) {}

  onShowModal(index: number) {
    this.isShowModal = true;
    this.currentSelectedForModal = index;
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const paramUpdate = {
        returnNo: this.selectedPenerimaanBrgBks.returnNo,
        status: 'T',
        user: this.g.getLocalstorage('inv_currentUser').namaUser,
        flagBrgBekas: 'Y',
      };

      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi:moment().format('D MMM YYYY'),
        statusPosting: 'P',
        noDocument: this.selectedPenerimaanBrgBks.returnNo,
        keterangan: 'penerimaan barang bekas otomatis',
        kodeCabang: this.selectedPenerimaanBrgBks.outletCode,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.listProductData
          .filter((item) => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map((item) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi:moment().format('D MMM YYYY'),
            tipeTransaksi: 10,
            kodeBarang: item.kodeBarang,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyWasteBesar || 0,
            qtyKecil: item.qtyWasteKecil || 0,
            totalQty:
              this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi +
              this.helper.sanitizedNumber(item.qtyWasteKecil),
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
      };

      Swal.fire({
        title:
          'Pastikan semua data sudah di input dengan benar, PERIKSA SEKALI LAGI...!!',
        text: 'DATA YANG SUDAH DIPOSTING TIDAK DAPAT DIPERBAIKI..!!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proses Posting',
        cancelButtonText: 'Batal Posting',
      }).then((result) => {
        if (result.isConfirmed) {
          this.appService
            .insert('/api/receiving-product-wasted/insert', param)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                } else {
                  this.appService
                    .updateWarehouse('/api/return-order/update', paramUpdate)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                      next: (res2) => {
                        if (!res2.success) {
                          this.toastr.warning(
                            'Data berhasil diposting, tetapi update status retur gagal!'
                          );
                        } else {
                          this.toastr.success(
                            'Data penerimaan barang bekas berhasil diposting dan status retur diperbarui!'
                          );
                        }
                        this.adding = false;
                        this.loadingSimpan = false;
                        this.onPreviousPressed();
                      },
                      error: () => {
                        this.toastr.warning(
                          'Data berhasil diposting, tetapi gagal update status retur!'
                        );
                        this.loadingSimpan = false;
                      },
                    });
                }
                this.adding = false;
                this.loadingSimpan = false;
              },
              error: () => {
                this.loadingSimpan = false;
              },
            });
        } else {
          this.toastr.info('Posting dibatalkan');
          this.loadingSimpan = false;
        }
      });
    }
  }

  isDataInvalid(): boolean {
    return false
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/penerimaan-barang-bekas/list-retur']);
  }


}
