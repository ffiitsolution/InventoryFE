import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import moment from 'moment';
import { data } from 'jquery';
import { AppConfig } from '../../../../config/app.config';
import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import { CANCEL_STATUS, DEFAULT_DELAY_TIME, LS_INV_SELECTED_DELIVERY_ORDER, SEND_PRINT_STATUS_SUDAH } from '../../../../../constants';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';

@Component({
  selector: 'app-revisi-do-edit',
  templateUrl: './revisi-do-edit.component.html',
  styleUrl: './revisi-do-edit.component.scss',
})
export class RevisiDoEditComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  selectedOrder: any = JSON.parse(
    localStorage[LS_INV_SELECTED_DELIVERY_ORDER]
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
  listOrderData: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;

  protected config = AppConfig.settings.apiServer;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
  ) {
    this.g.navbarVisibility = true;
    this.selectedOrder = JSON.parse(this.selectedOrder);
    this.getDeliveryItemDetails()
  }



  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    const isCanceled = this.selectedOrder.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedOrder.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
  }

  getDeliveryItemDetails() {
    this.loading = true;
    this.listOrderData = [];

    const params = {
      nomorPesanan: this.selectedOrder.nomorPesanan
    };

    this.appService.getDeliveryItemDetails(params).subscribe(
      (res) => {
        this.listOrderData = res.data.map((data: any) => ({
          ...data,
          qtyBPesanOld: data.qtyPesanBesar,
          totalQtyPesanOld: data.totalQtyPesan
        }));
        this.totalLength = res?.data?.length;
        this.page = 1;
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      },
      () => {
        this.loading = false;
        // this.toastr.error(this.errorShowMessage, 'Maaf, Terjadi Kesalahan!');
      }
    );
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
    this.adding = true;
    let totalKirim = 0;
    let hasInvalidData = false; // Tambahkan flag untuk mengecek validasi

    const param = this.listOrderData
      .map((data: any) => {
        totalKirim = (data.qtyPesanBesar * data.konversi) + data.qtyPesanKecil;

        if (totalKirim > data.totalQtyPesanOld) {
          this.toastr.error(
            `Kode Barang: ${data.kodeBarang}, Qty Kirim (${totalKirim}) tidak boleh lebih besar dari Qty Pesan (${data.totalQtyPesanOld})`
          );
          hasInvalidData = true; 
          return null; // Hentikan pemrosesan item ini
        }

        return {
          kodeBarang: data.kodeBarang,
          qtyBKirim: data.qtyPesanBesar,
          qtyKKirim: data.qtyPesanKecil,
          konversi: data.konversi,
          noSuratJalan: this.selectedOrder.noSuratJalan
        };
      })
      .filter((item) => item !== null); 

    if (hasInvalidData || param.length === 0) {
      this.adding = false;
      return;
    }

    this.appService.revisiQtyDo(param).subscribe({
      next: (res) => {
        if (!res.success) {
          alert(res.message);
        } else {
          this.toastr.success("Berhasil!");
          setTimeout(() => {
            this.router.navigate(["/transaction/delivery-item/revisi-do"]);
          }, DEFAULT_DELAY_TIME);
        }
        this.adding = false;
      },
      error: (err) => {
        console.error("Error saat insert:", err);
        this.adding = false;
      },
    });
  }
}
