import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom, Subject } from 'rxjs';
import { AppConfig } from 'src/app/config/app.config';
import { Page } from 'src/app/model/page';
import { AppService } from 'src/app/service/app.service';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import {
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_RECEIVING_ORDER,
  STATUS_SAME_CONVERSION,
} from 'src/constants';

@Component({
  selector: 'app-add-detail-form',
  templateUrl: './add-detail-form.component.html',
  styleUrl: './add-detail-form.component.scss',
})
export class ReceivingOrderAddDetailFormComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  showFilterSection: boolean = false;
  savingReceive: boolean = false;
  dtOptions: DataTables.Settings = {};
  page = new Page();
  dtColumns: any = [];
  selectedOrder: any = JSON.parse(
    localStorage[LS_INV_SELECTED_RECEIVING_ORDER]
  );
  protected config = AppConfig.settings.apiServer;
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private router: Router,
    public translation: TranslationService,
    private service: AppService,
    private toastr: ToastrService
  ) {
    this.dtOptions = {
      language:
        this.translation.getCurrentLanguage() == 'id'
          ? this.translation.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          nomorPesanan: this.selectedOrder.nomorPesanan || '',
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL_HQ +
                '/api/receiving-order/get-from-hq/detail/dt',
              params
            )
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  konversi: `${rest.konversi} ${rest.satuanBesar}/${rest.satuanKecil}`,
                  konversiProduct: `${rest.konversiProduct || 0} ${
                    rest.satuanBesarProduct || '-'
                  }/${rest.satuanKecilProduct || '-'}`,
                  qtyPesanBesar: this.g.formatToDecimal(rest.qtyPesanBesar),
                  totalQtyPesan: this.g.formatToDecimal(rest.totalQtyPesan),
                  qtyPesanKecil: this.g.formatToDecimal(rest.qtyPesanKecil),
                };
                return finalData;
              });
              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
              this.showFilterSection = false;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: mappedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'dtIndex', title: '#' },
        { data: 'kodeBarang', title: 'Kode Barang', searchable: true },
        { data: 'namaBarang', title: 'Nama Barang', searchable: true },
        { data: 'konversi', title: 'Konversi Pesan' },
        { data: 'qtyPesanBesar', title: 'Qty Pesan Besar' },
        { data: 'qtyPesanKecil', title: 'Qty Pesan Kecil' },
        { data: 'totalQtyPesan', title: 'Total Pesanan' },
        { data: 'konversiProduct', title: 'Konversi Gudang' },
        {
          data: 'keterangan',
          title: 'Keterangan',
          render: (data) => {
            if (data.toUpperCase() == STATUS_SAME_CONVERSION) {
              return `
                <span class="text-center text-success">${data}</span>
              `;
            } else {
              return `
                <span class="text-center text-danger">${data}</span>
              `;
            }
          },
        },
      ],
      searchDelay: 1000,
      order: [
        [2, 'asc'],
        [4, 'asc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () => {});
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
  }
  onPreviousPressed() {
    this.router.navigate(['/order/receiving-order/add']);
  }
  ngOnInit(): void {}
  onFilterTogglePressed() {}
  onFilterApplied() {}
  AfterViewInit() {
    this.rerenderDatatable();
  }
  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }
  dtPageChange(event: any) {}
  ngAfterViewInit() {
    this.rerenderDatatable();
  }

  async onSavePressed() {
    this.savingReceive = true;
    const detailResponse = await lastValueFrom(
      this.service.getReceivingOrderItem(this.selectedOrder.nomorPesanan)
    );

    if (!detailResponse.success) {
      this.insertReceivingOrder(detailResponse.data);
    } else {
      this.toastr.error(
        `Error while get detail from HQ. ${detailResponse.message}`
      );
      this.savingReceive = false;
    }
  }

  async insertReceivingOrder(data: any) {
    const paramInsertOrder = {
      kodeGudang: this.selectedOrder.kodeTujuan,
      kodePemesan: this.g.trimOutletCode(this.selectedOrder.kodePemesan),
      nomorPesanan: this.selectedOrder.nomorPesanan,
      tglPesan: this.selectedOrder.tglPesan.split(' - ')[0],
      tglBrgDikirim: this.selectedOrder.tglBrgDikirim.split(' - ')[0],
      tglKadaluarsa: this.selectedOrder.tglBatasExp,
      keterangan: this.selectedOrder.keterangan1,
      user: this.g.getUserCode(),
      items: data.map((item: any) => ({
        ...item,
        totalQtyTerima: 0,
      })),
    };
    const paramUpdateStatusOrder = {
      status: 'T',
      user: this.g.getUserCode(),
      nomorPesanan: this.selectedOrder.nomorPesanan,
      kodeTujuan: this.g.getUserLocationCode(),
    };

    const insertResponse = await lastValueFrom(
      this.service.insertReceivingOrder(paramInsertOrder)
    );

    if (insertResponse.success) {
      const updateStatusResponse = await lastValueFrom(
        this.service.updateReceivingOrderStatus(paramUpdateStatusOrder)
      );
      if (updateStatusResponse.success) {
        this.toastr.success('Berhasil!');
        setTimeout(() => {
          this.router.navigate(['/order/receiving-order']);
        }, DEFAULT_DELAY_TIME);
      } else {
        this.toastr.error(updateStatusResponse.message);
      }
    } else {
      this.toastr.error(insertResponse.message);
    }
    this.savingReceive = false;
  }
}
