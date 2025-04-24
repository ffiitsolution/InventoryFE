import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject, takeUntil } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
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
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';
import { DatePipe } from '@angular/common';
import { DataService } from '../../../../service/data.service';
import { AppConfig } from '../../../../config/app.config';
@Component({
  selector: 'app-add-penerimaan-brg-bks',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
  providers: [DatePipe],
})
export class AddPenerimaanBrgBksComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  protected config = AppConfig.settings.apiServer;
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptionsRetur: DataTables.Settings = {};
  isShowModal: boolean = false;
  isShowModalRetur: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRow: any = {};
  selectedRowRetur: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  selectedRowData: any;
  defaultDate: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  buttonCaptionSelect: string = BUTTON_CAPTION_SELECT;
  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  buttonCaptionPrint: String = 'Cetak';
  alreadyPrint: boolean = false;
  disabledPrintButton: boolean = false;
  isDisabledCabang: boolean = false;
  @ViewChild('formModal') formModal: any;
  // Form data object

  constructor(
    private router: Router,
    private helperService: HelperService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private form: FormBuilder,
    private appService: AppService,
    private dataService: DataService,
    private datePipe: DatePipe
  ) {
    this.dpConfigtrans.containerClass = 'theme-dark-blue';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.minDate = new Date();
    this.dpConfigtrans.customTodayClass = 'today-highlight';

    // this.dpConfigtrans.containerClass = 'theme-red';
    // this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    // this.dpConfigtrans.adaptivePosition = true;
    // this.dpConfigtrans.maxDate = new Date();
    // this.dpConfigtrans.customTodayClass='today-highlight';
  }

  myForm: FormGroup;

  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );

    const todayDate = new Date();
    this.defaultDate = this.helperService.formatDate(todayDate);

    this.myForm = this.form.group({
      noDocument: ['', [Validators.required, this.specialCharValidator]],
      kodeCabang: ['', [Validators.required]],
      namaCabang: ['', [Validators.required]],
      tglTransaksi: [this.defaultDate, [Validators.required]],
      alamatCabang: ['', [Validators.required]],
      keterangan: ['', [this.specialCharValidator]],
      jumlahItem: [1],
    });

    this.renderDataTablesRetur();
    this.renderDataTables();
  }

  onAddDetail() {
    this.myForm.patchValue({
      tglTransaksi: moment(
        this.myForm.value.tglTransaksi,
        'DD/MM/YYYY',
        true
      ).format('DD/MM/YYYY'),
    });

    this.globalService.saveLocalstorage(
      'headerBrgBks',
      JSON.stringify(this.myForm.value)
    );
    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return true;
    // return Object.values(this.formData).some(value => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage('headerBrgBks');
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/penerimaan-barang-bekas/list']);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  onShowModalRetur() {
    this.isShowModalRetur = true;
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRow = JSON.stringify(data);
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
  }

  actionBtnClickRetur(data: any = null) {
    console.log(data, 'data');
    this.selectedRowRetur = JSON.stringify(data);
    this.isShowModalRetur = false;
    this.mapReturData(data);
  }

  //   renderDataTables(): void {
  //     this.dtOptions = {
  //       language:
  //         this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
  //       processing: true,
  //       serverSide: true,
  //       autoWidth: true,
  //       info: true,
  //       drawCallback: (drawCallback) => {
  //         this.selectedRowData = undefined;
  //       },
  //       ajax: (dataTablesParameters: any, callback) => {
  //         this.page.start = dataTablesParameters.start;
  //         this.page.length = dataTablesParameters.length;
  //         const requestData = {
  //           ...dataTablesParameters,
  //         };
  //         this.dataService
  //           .postData(this.globalService.urlServer + '/api/branch/dt', requestData)
  //           .subscribe((resp: any) => {
  //             const mappedData = resp.data.map((item: any, index: number) => {
  //               // hapus rn
  //               const { rn, ...rest } = item;
  //               const finalData = {
  //                 ...rest,
  //                 kodeKeteranganRsc: `${rest.kodeRsc} - ${rest.keteranganRsc}`,
  //                 dtIndex: this.page.start + index + 1,
  //               };
  //               return finalData;
  //             });
  //             this.page.recordsTotal = resp.recordsTotal;
  //             this.page.recordsFiltered = resp.recordsFiltered;
  //             callback({
  //               recordsTotal: resp.recordsTotal,
  //               recordsFiltered: resp.recordsFiltered,
  //               data: mappedData,
  //             });
  //           });
  //       },
  //       columns: [
  //         { data: 'dtIndex', title: '#', orderable: false, searchable: false },
  //         { data: 'kodeCabang', title: 'Kode', searchable: true },
  //         { data: 'namaCabang', title: 'Nama', searchable: true },
  //         { data: 'keteranganRsc', title: 'RSC', searchable: true },
  //         { data: 'kota', title: 'Kota', searchable: true },
  //         { data: 'deskripsiGroup', title: 'Group', searchable: true },
  //         {
  //           data: 'statusAktif',
  //           title: 'Status',
  //           searchable: false,
  //           render: (data) => {
  //             if (data === 'A') {
  //               return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
  //             }
  //             return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:grey; width: 60px">Inactive</span> </div>`;
  //           },
  //         },
  //         {
  //           title: 'Action',
  //           render: (data, type, row) => {
  //             if (row.statusAktif === 'T') {
  //               return `
  //                 <div class="btn-group" role="group" aria-label="Action">
  //                   <button class="btn btn-sm action-select btn-outline-info btn-60" disabled>Pilih</button>
  //                 </div>
  //               `;
  //             }
  //             else
  //               return `
  //               <div class="btn-group" role="group" aria-label="Action">
  //                 <button class="btn btn-sm action-select btn-outline-info btn-60">Pilih</button>
  //               </div>
  //             `;
  //           }
  //         }

  //       ],
  //       searchDelay: 1500,
  //       order: [
  //         [1, 'asc'],
  //       ],
  // rowCallback: (row: Node, data: any[] | Object, index: number) => {
  //        $('.action-select', row).on('click', () =>
  //          this.actionBtnClick(ACTION_SELECT, data)
  //        );
  //        if (index === 0 && !this.selectedRowData) {
  //          setTimeout(() => {
  //            $(row).trigger('td');
  //          }, 0);
  //        }
  //        $('td', row).on('click', () => {
  //          $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
  //          if (this.selectedRowData !== data) {
  //            this.selectedRowData = data;
  //            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
  //          } else {
  //            this.selectedRowData = undefined;
  //          }
  //        });

  //        return row;

  //      },
  //     };
  //   }

  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id'
          ? this.translationService.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      lengthMenu: [
        // Provide page size options
        [8, 10], // Available page sizes
        ['8', '10'], // Displayed page size labels
      ],
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
        };
        this.appService.getBranchList(params).subscribe((resp: any) => {
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
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'kodeCabang', title: 'Kode', searchable: true },
        // { data: 'kodeSingkat', title: 'Inisial', searchable: true },
        // { data: 'tipeCabang', title: 'Tipe', searchable: true },
        { data: 'namaCabang', title: 'Nama Site', searchable: true },
        { data: 'deskripsiGroup', title: 'Group', searchable: true },
        {
          data: 'alamat1', // or data: 'alamat' if needed, but `null` works fine when using render
          title: 'Alamat',
          searchable: false,
          width: '200px',
          render: function (data, type, row) {
            return `${row.alamat1 || ''}, ${row.alamat2 || ''}`.trim();
          },
        },
        { data: 'kota', title: 'Kota', searchable: true },
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

  private mapOrderData(data: any): void {
    this.myForm.patchValue({
      kodeCabang: data.kodeCabang,
      namaCabang: data.namaCabang,
      alamatCabang: data.alamat1 + ', ' + data.alamat2,
    });
  }

  onBatalPressed(newItem: any): void {
    const todayDate = new Date();
    this.defaultDate = this.helperService.formatDate(todayDate);
    this.myForm.reset({
      noDocument: '',
      kodeCabang: '',
      namaCabang: '',
      alamatCabang: '',
      tglTransaksi: this.defaultDate, // Assign default date to tglTransaksi
      keterangan: '',
      jumlahItem: '0',
    });
    this.isShowDetail = false;

    if (newItem) this.onShowModalPrint(newItem);
  }

  addJumlahBrgBks($event: any): void {
    this.myForm.patchValue({
      jumlahItem: $event,
    });
  }

  formatDate(date: string | Date): string {
    console.log(date, 'date');
    if (typeof date === 'string') {
      return date;
    } else {
      return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    }
  }

  specialCharValidator(control: AbstractControl): ValidationErrors | null {
    const specialCharRegex = /[^a-zA-Z0-9&\-().\s]/;
    const value = control.value;
    if (value && specialCharRegex.test(value)) {
      return { specialCharNotAllowed: true };
    }
    return null;
  }

  onShowModalPrint(data: any) {
    this.paramGenerateReport = {
      nomorTransaksi: data.nomorTransaksi,
      userEntry: data.userCreate,
      jamEntry: this.globalService.transformTime(data.timeCreate),
      tglEntry: this.globalService.transformDate(data.dateCreate),
      outletBrand: 'KFC',
      kodeGudang: this.globalService.getUserLocationCode(),
      isDownloadCsv: false,
      reportName: 'cetak_penerimaan_barang_bekas',
    };
    this.isShowModalReport = true;
    // this.onBackPressed();
  }

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  renderDataTablesRetur(): void {
    this.dtOptionsRetur = {
      language:
        this.translationService.getCurrentLanguage() == 'id'
          ? this.translationService.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      lengthMenu: [
        // Provide page size options
        [8, 10], // Available page sizes
        ['8', '10'], // Displayed page size labels
      ],
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParametersRetur: any, callback) => {
        this.page.start = dataTablesParametersRetur.start;
        this.page.length = dataTablesParametersRetur.length;
        const params = {
          ...dataTablesParametersRetur,
          kodeGudang: this.globalService.getUserLocationCode(),
          status: 'K',
        };
        this.dataService
          .postData(
            this.config.BASE_URL_HQ + '/api/return-order/get-from-hq/dt',
            params
          )
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
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'returnNo', title: 'Tipe', searchable: true },
        { data: 'outletCode', title: 'Kode', searchable: true },
        { data: 'namaPengirim', title: 'Inisial', searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data) => {
            if (data === 'Aktif') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          render: (data, type, row) => {
            if (row.statusAktif === 'Aktif') {
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
        [2, 'asc'],
        [1, 'asc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClickRetur(data)
        );

        return row;
      },
    };
  }

  handleEnterRetur(event: any) {
    event.preventDefault(); // Prevents the form from submitting

    this.dataService
      .postData(this.config.BASE_URL_HQ + '/api/return-order/list-search', {
        returnNo: event.target.value,
        kodeGudang: this.globalService.getUserLocationCode(),
        status: 'K',
      })
      .subscribe((resp: any) => {
        if (resp.length > 0) {
          this.mapReturData(this.globalService.convertKeysToCamelCase(resp[0]));
        } else this.resetReturData();
      });
  }

  private mapReturData(data: any): void {
    this.myForm.patchValue({
      kodeCabang: data.outletCode,
      namaCabang: data.namaPengirim,
      alamatCabang: data.alamatPengirim,
      noDocument: data.returnNo,
    });

    if (data.outletCode) {
      this.isDisabledCabang = true;
    }
  }

  private resetReturData(): void {
    this.myForm.patchValue({
      kodeCabang: '',
      namaCabang: '',
      alamatCabang: '',
    });
  }
}
