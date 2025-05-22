import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
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
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../../constants';
import { AppService } from '../../../../service/app.service';
import { Page } from '../../../../model/page';
import { data } from 'jquery';
import { forEach } from 'lodash-es';
import { TranslationService } from '../../../../service/translation.service';

@Component({
  selector: 'app-entry-packing-list',
  templateUrl: './entry-packing-list.component.html',
  styleUrls: ['./entry-packing-list.component.scss'],
})
export class EntryPackingListComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  dtOptions_2: any = {};
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
  isShowPrintModal: boolean = false;
  dateRangeFilter: any = [new Date(), new Date()];
  dataUser: any;
  nomorDoList: any;
  isShowModal: boolean = false;
  selectedRo: any = {};
  selectedData: any;
  singleDoData: any;
  printingPdf: boolean = false;
  printingPrinter: boolean = false;
  protected config = AppConfig.settings.apiServer;
  validationMessages: { [key: number]: string } = {};
  isSingleDo: boolean = false;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    public router: Router,
    private toastr: ToastrService,
    private appService: AppService,
    private translation: TranslationService,

  ) {
    this.minDate.setDate(this.minDate.getDate() - 7);
    this.dtOptions_2 = {
      paging: true,
      processing: true,
      serverSide: true,
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeArea: this.g.getUserAreaCode(),
        };
        this.getListGudang(params, callback);
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
      },
      autoWidth: true,
      info: true,
      columns: [
        {
          data: 'kodeCabang',
          title: 'Kode Cabang',
          className: 'text-center',
          orderable: true,
          searchable: true
        },
        {
          data: 'namaCabang',
          title: 'Nama Cabang',
          className: 'text-center',
          orderable: true,
          searchable: true
        },
        {
          data: 'kodeGroup',
          title: 'Group',
          className: 'text-center',
        },
        {
          title: 'Alamat', // Nama kolom yang sama untuk keduanya
          className: 'text-center',
          render: function (data: any, type: any, row: any) {
            let alamat1 = row.alamat1 ? row.alamat1 : '-'; // Cek jika null
            let alamat2 = row.alamat2 ? row.alamat2 : '-';
            return `${alamat1} <br> ${alamat2}`;
          },
          searchable: true
        },
        { data: 'kota', title: 'Kota', className: 'text-center' },
        {
          title: 'Action',
          render: () => {
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white">Pilih</button>`;
          },
        },
      ],
      searchDelay: 600,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        return row;
      },
      order: [[2, 'desc']],
    };
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
  }

  ngOnInit(): void {
    this.nomorDoList = JSON.parse(localStorage.getItem('listNoDO') || '[]');
    this.getProsesDoBalik();

  }

  actionBtnClick(action: string, data: any): void {
    if (action === ACTION_SELECT) {
      this.isShowModal = false
      this.isShowPrintModal = true;
      this.selectedData = {
        ...this.selectedData,
        data
      };
      const paramTujuan = {
        tujuan: data.kodeCabang + ' - ' + data.namaCabang,
        alamatTujuan: data.alamat1 + ',' + data.alamat2 + ',' + data.kota + ' ' + data.kodePos
      }
    }
  }


  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  onShowModal() {
    if (this.isSingleDo) {
      this.isShowPrintModal = true;
    } else {
      this.filteredEntryPL.forEach((item: any, index: number) => {
        if (item.nomorColli === "") {
          this.validationMessages[index] = "Mohon isi data!";
        }
      });

      this.isShowModal = !this.filteredEntryPL.some((item: any) => item.nomorColli === "");
      this.isShowPrintModal = false
    }

  }


  actionBtnClickInModal(action: string, data: any = null) {
    this.selectedRo = JSON.stringify(data);
    // this.renderDataTables();
    this.isShowModal = false;
    // this.mapOrderData(data);
    // this.onSaveData();
  }

  dtPageChange(event: any): void { }

  search(): void {
    this.datatableElement?.dtInstance.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }

  getProsesDoBalik(): void {
    this.loading = true;
    const parsedDoList = JSON.parse(this.nomorDoList);
    if (parsedDoList.length === 1) {
      this.isSingleDo = true
      this.singleDoData = parsedDoList[0]
    }
    const listParam = parsedDoList.map((item: any) => {
      return {
        kodeGudang: this.g.getUserLocationCode(),
        noSuratJalan: item.noSuratJalan,
      };
    });

    const payload: any = {
      listParam: listParam
    };

    this.dataService
      .postData(
        this.config.BASE_URL + '/api/delivery-order/entry-packing-list',
        payload
      )
      .subscribe(
        (response: any) => {
          this.listEntryPl = response.packingList;
          // this.listEntryPl.forEach((item: any) => {
          //   item.nomorColli = '0';
          //   item.jumlahColli = '0';
          // });

          this.filteredEntryPL = this.listEntryPl;
          this.totalLength = response.recordsTotal;
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
  }

  getListGudang(param: any, callback: any): void {
    this.loading = true;

    this.dataService
      .postData(this.config.BASE_URL + '/api/delivery-order/get-site-info', param)
      .subscribe(
        (response: any) => {
          console.log('Site info data:', response.data.length);
          let index = 0;
          dtIndex: this.page.start + index + 1;
          this.reportProposeData = response.data;
          this.totalLength = response?.length;
          this.page.recordsTotal = response.recordsTotal;
          this.page.recordsFiltered = response.recordsFiltered;
          this.showFilterSection = false;

          callback({
            recordsTotal: response.recordsTotal,
            recordsFiltered: response.recordsFiltered,
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
    this.datatableElement?.dtInstance.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }

  navigateToDeliveryItem(): void {
    this.router.navigate(['/transaction/delivery-item/add-data']);
  }

  searchDetail = '';
  filteredEntryPL: any[] = [];
  listEntryPl: any[] = [];
  listCurrentPage: number = 1;
  totalLengthList: number = 1;

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
    // const target = event.target;
    // const value = target.value;

    // if (this.listEntryPl[index]) {
    //   this.listEntryPl[index][target.name] = value;
    // }
    // this.filteredEntryPL.forEach((item: any, index: number) => {
    //   if (item.nomorColli === "") {
    //     this.validationMessages[index] = "Mohon isi data!";
    //   } else {
    //     this.validationMessages[index] = "";
    //   }
    // });
  }

  async onSubmit(typePrint: any) {
    if (typePrint === 'download') {
      this.printingPdf = true;
    } else {
      this.printingPrinter = true;
    }
    const tanggalCetak = this.g.transformDate(new Date().toISOString());
    const nomorPl = '    Automatic';

    const tujuan = `${this.selectedData?.data?.kodeCabang ?? '-'} - ${this.selectedData?.data?.namaCabang ?? '-'}`;

    const alamatTujuan = [
      this.selectedData?.data?.alamat1,
      this.selectedData?.data?.alamat2,
      this.selectedData?.data?.kota,
      this.selectedData?.data?.kodePos
    ].filter(Boolean).join(', ');

    const currentUser = this.g.getLocalstorage('inv_currentUser');
    const namaGudang = currentUser?.namaCabang ?? '-';
    const kodeGudang = currentUser?.defaultLocation?.kodeLocation ?? '-';


    let totalColli = 0;
    let totalBerat = 0;
    let totalVolume = 0;

    const groupedData = this.listEntryPl.reduce((acc, data, index) => {
      const key = `${data.noSuratJalan}-${data.kodeBarang}`;
      const jumlahQty = parseInt(data.totalQtyKirim) || 0;
      const jumlahColli = parseInt(data.jumlahColli) || 0;
      const konversi = data.konversi || 1;
      const beratMaster = data.berat || 0;
      const volumeMaster = data.volume || 0;
      data.nomorColli = data.nomorColli || '';
      data.jumlahColli = data.jumlahColli || '0';

      if (!acc[key]) {
        acc[key] = { ...data, totalBerat: 0, totalVolume: 0 };
      }

      // Hitung total berat & volume
      acc[key].totalBerat += (jumlahQty / konversi) * beratMaster;
      acc[key].totalVolume += (jumlahQty / konversi) * volumeMaster;

      // Akumulasi total colli
      totalColli += jumlahColli;

      // Simpan tanggal kirim dari entri pertama

      return acc;
    }, {} as { [key: string]: any });

    const listDataPL = Object.values(groupedData).map((item: any) => {
      const totalBeratFix = parseFloat(item.totalBerat.toFixed(2));
      const totalVolumeFix = parseFloat(item.totalVolume.toFixed(2));

      totalBerat += totalBeratFix;
      totalVolume += totalVolumeFix;

      return {
        ...item,
        berat: totalBeratFix, // Perbarui berat dengan hasil pembulatan
        totalVolume: totalVolumeFix, // Pastikan volume juga dibulatkan
      };
    });

    // 3. **Bulatkan total keseluruhan ke 2 desimal**
    totalBerat = parseFloat(totalBerat.toFixed(2));
    totalVolume = parseFloat(totalVolume.toFixed(2));

    // 4. **Membentuk parameter untuk API**

    let params = {}
    if (!this.isSingleDo) {
      params = {
        outletBrand: 'KFC',
        tanggalCetak,
        nomorPl,
        namaGudang,
        tujuan,
        alamatTujuan,
        totalColli: totalColli.toString(),
        totalBerat: totalBerat.toString(),
        totalVolume: totalVolume.toString(),
        listDataPL,
        tanggalKirim: this.g.transformDate(new Date().toISOString()),
        kodeGudang: kodeGudang
      };
    } else {
      params = {
        outletBrand: 'KFC',
        tanggalCetak,
        nomorPl: this.singleDoData.noSuratJalan,
        namaGudang,
        tujuan: `${this.singleDoData.kodeTujuan} - ${this.singleDoData.namaTujuan}`,
        alamatTujuan: `${this.singleDoData.alamatTujuan}, ${this.singleDoData.alamatTujuanLanjutan}, ${this.singleDoData.kotaTujuan}`,
        totalColli: totalColli.toString(),
        totalBerat: totalBerat.toString(),
        totalVolume: totalVolume.toString(),
        listDataPL,
        tanggalKirim: this.g.transformDate(this.singleDoData.tglTransaksi),
        kodeGudang: kodeGudang,
        jamCetak: this.g.transformTime(new Date().toISOString()),
        nomorPesanan: this.singleDoData.nomorPesanan,
        tglPesanan: this.g.transformDate(this.singleDoData.tglPesanan)
      };
    }
    try {
      let response$;

      if (!this.isSingleDo) {
        response$ = this.dataService.postData(
          this.config.BASE_URL + '/api/delivery-order/entry-packing-list-report',
          params,
          true
        );
      } else {
        response$ = this.dataService.postData(
          this.config.BASE_URL + '/api/delivery-order/entry-packing-list-report-single-do',
          params,
          true
        );
      }

      const base64Response = await lastValueFrom(response$);

      const blob = new Blob([base64Response as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.toastr.success('Sukses mencetak Packing List');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // "2025-04-16T12-34-56-789Z"
      const fileName = `packing-list-${nomorPl}_${timestamp}.pdf`;
      if (typePrint === 'download') {
        this.printingPdf = true;
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        this.printingPrinter = true;
        window.open(url);
      }
      this.printingPdf = false;
      this.printingPrinter = false;
    } catch (error: any) {
      this.toastr.error(error.message ?? 'Unknown error while generating PDF');
      this.printingPdf = false;
      this.printingPrinter = false;
    }
  }


  onChooseDestinaton() {
    this.isShowPrintModal = true;
  }

}
