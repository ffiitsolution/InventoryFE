import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
  Output,
  ChangeDetectorRef ,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject, takeUntil } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../../model/page';
import { AppService } from '../../../../service/app.service';
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER, BUTTON_CAPTION_SELECT,DEFAULT_DATE_RANGE_RECEIVING_ORDER } from '../../../../../constants';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';
import { DatePipe } from '@angular/common';
import { AppConfig } from '../../../../config/app.config';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-kirim-barang-return-ke-supplier',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
  providers: [DatePipe]

})
export class AddKirimBarangReturnKeSupplierComponent implements OnInit, AfterViewInit, OnDestroy {
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {};
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRow: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  isShowDetailBranch: boolean = false;
  selectedRowData: any;
  defaultDate: any ;
  someBoolean: boolean = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  buttonCaptionSelect: string = BUTTON_CAPTION_SELECT;
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
      this.currentDate.setDate(
        this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
      )
    );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  isShowModalBranch: boolean = false;
  dtOptionsBranch: any = {};
  selectedRowDataBranch: any;
  pageBranch = new Page();
  selectedRowRetur: any = {};

  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  disabledPrintButton: boolean = false;
  alreadyPrint: boolean = false;


  @ViewChild('formModal') formModal: any;
  // Form data object
  protected config = AppConfig.settings.apiServer;

  constructor(
    private router: Router,
    private helperService: HelperService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private form: FormBuilder,
    private appService: AppService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private toastr: ToastrService,
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.minDate = new Date();

    this.dpConfigtrans.containerClass = 'theme-red';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    this.dpConfigtrans.customTodayClass='today-highlight';
  }


  myForm: FormGroup;

  formData: {
    kodeTujuan: string;
    // noReturnPengirim : string;
    namaTujuan: string;
    alamatTujuan: string;
    statusTujuan: string;
    keterangan: string;
    tglTransaksi?: Date;
  } = {
    kodeTujuan: '',
    // noReturnPengirim: '',
    namaTujuan: '',
    alamatTujuan: '',
    statusTujuan: '',
    keterangan: '',
  };


  ngOnInit(): void {

    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );

    const todayDate = new Date();
    const [day, month, year] = this.helperService.formatDate(todayDate).split('/').map(Number);
    this.defaultDate = new Date(year, month - 1, day);

    this.myForm = this.form.group({
          kodeBarang: ['', [Validators.required]],
          namaBarang: ['', [Validators.required]],
          alamatPengirim: ['', [Validators.required]],
          // noReturnPengirim:['', [Validators.required]],
          satuanHasilProduksi: ['', [Validators.required]],
          tglTransaksi: [this.defaultDate, [Validators.required]],
          // jumlahHasilProduksi: ['', [Validators.required,Validators.min(1)]],
          keterangan: ['', this.specialCharValidator],
          // tglExp:[this.defaultDate, [Validators.required]],
          // totalHasilProduksi: ['', [Validators.required,Validators.min(1)]],
          labelSatuanHasilProduksi: [''],
          totalBahanBaku: [0],
    });

    this.myForm.get('jumlahHasilProduksi')?.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(() => {
      this.calculateTotalHasilProduksi();
    });

    this.myForm.get('satuanHasilProduksi')?.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(() => {
      this.calculateTotalHasilProduksi();
    });

    this.renderDataTables();
    this.renderDataTablesBranch();

  }

  onAddDetail() {
    const keteranganValue = this.myForm.get('keterangan')?.value;

    if (!keteranganValue || keteranganValue.trim() === '') {
      this.showWarningModal(
        'CATATAN/KETERANGAN PENGEMBALIAN BARANG, TIDAK BOLEH DIKOSONGKAN, PERIKSA KEMBALI...!!!'
      );
      return;
    }

    this.myForm.patchValue({
          tglTransaksi: moment(this.myForm.value.tglTransaksi,'DD/MM/YYYY',true).format('DD/MM/YYYY'),
          tglExp: moment(this.myForm.value.tglExp, 'DD/MM/YYYY',true).format('DD/MM/YYYY')
      });

    this.globalService.saveLocalstorage(
      'headerProduction',
      JSON.stringify(this.myForm.value)
    );

    this.isShowDetail = true;
    this.isShowDetailBranch = true;
  }

  get isFormInvalid(): boolean {
    return true
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
    this.someBoolean = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage(
      'headerProduction',
    );
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  actionBtnClick(data: any = null) {
    const params = {
      noDoc:  data.returnNo,
    };

    const paramUpdate = {
      returnNo: data.returnNo,
      status: 'T',
      user: this.globalService.getLocalstorage('inv_currentUser').namaUser,
      flagBrgBekas: 'T',
    };

    this.appService.checkNoReturFromSiteExist(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((resp: any) => {
        console.log('on going', resp)
          if(resp){
            console.log('berhasil', resp)
            this.toastr.error(`No retur tersebut sudah di input secara manual!`);
            this.appService
                    .updateWarehouse('/api/return-order/update', paramUpdate)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                      next: (res2) => {

                        const currentUrl = this.router.url;
                        this.router.navigateByUrl('/empty', { skipLocationChange: true }).then(() => {
                          this.router.navigate([currentUrl]);
                        });
                      },
                    });
          }else{
            console.log('gagal', resp)
            this.selectedRowRetur = JSON.stringify(data);
            this.isShowModal = false;
            this.mappingDataPemesan(data);
          }
      });

    this.formData.kodeTujuan = data?.outletCode;
    this.formData.tglTransaksi = data?.dateReturn ? new Date(data.dateReturn) : undefined;
    this.formData.namaTujuan = data?.namaPengirim;
    this.formData.alamatTujuan = data?.alamatPengirim;
    this.formData.statusTujuan = this.convertStatusAktif(data?.statusAktif); // ✅ Gunakan function ini
    // this.formData.noReturnPengirim = data?.returnNo;
    this.isShowModal = false;
  }

  actionBtnClickBranch(data: any = null) {
    this.formData.kodeTujuan = data?.kodeSupplier;
    this.formData.namaTujuan = data?.namaSupplier;
    this.formData.alamatTujuan = data?.alamat;
    this.formData.statusTujuan = this.convertStatusAktif(data?.statusAktif); // ✅ Gunakan function ini
    this.isShowModalBranch = false;
  }

  convertStatusAktif(statusAktif: string): string {
    const status = statusAktif?.trim().toUpperCase();
    if (status === 'AKTIF') {
      return 'A';
    } else if (status === 'TIDAK AKTIF') {
      return 'T';
    } else if (status === 'A' || status === 'T') {
      return status;
    }
    return '-'; // Atau default lainnya
  }


  getStatusAktifText(statusAktif: string): string {
    const statusMap: { [key: string]: string } = {
      'A': 'Aktif',
      'T': 'Tidak Aktif'
    };
    return statusMap[statusAktif] || '-';
  }

  handleEnterPemesan(event: any) {
    event.preventDefault(); // Prevents the form from submitting

    this.dataService
    .postData(this.config.BASE_URL_HQ + '/api/return-order/list-search',
      {"returnNo":  event.target.value,
        "kodeGudang" : this.globalService.getUserLocationCode(),
        "status" : 'K'
      }
    )
    .subscribe((resp: any) => {
      if(resp.length > 0) {
        this.mappingDataPemesan(this.globalService.convertKeysToCamelCase(resp[0]))
      }
      else
        this.resetDataPemesan();
    });
  }


  resetDataPemesan() {
    this.myForm.controls['kodeBarang'].setValue("");
    this.myForm.controls['namaBarang'].setValue("");
    this.myForm.controls['alamatPengirim'].setValue("");
    // this.myForm.controls['noReturnPengirim'].setValue("");
    this.myForm.controls['satuanHasilProduksi'].setValue("");
    this.myForm.controls['keterangan'].setValue("");
  }

  mappingDataPemesan(data : any) {
    this.myForm.controls['kodeBarang'].setValue(data.outletCode);
    this.myForm.controls['namaBarang'].setValue(data.namaPengirim);
    let statusValue = '';
      if (data.statusAktif?.trim().toUpperCase() === 'AKTIF') {
        statusValue = 'A';
      } else if (data.statusAktif?.trim().toUpperCase() === 'TIDAK AKTIF') {
        statusValue = 'T';
      } else {
        statusValue = data.statusAktif;
      }
    this.myForm.controls['satuanHasilProduksi'].setValue(statusValue);
    this.myForm.controls['alamatPengirim'].setValue(data.alamatPengirim);
    // this.myForm.controls['noReturnPengirim'].setValue(data.returnNo);
  }


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/kirim-barang-return-ke-supplier/list-dt']);
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
      pageLength:5,
      lengthMenu: [  // Provide page size options
        [8, 10],   // Available page sizes
        ['8', '10']  // Displayed page size labels
      ],
      drawCallback: (drawCallback:any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback:any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
          status: 'K',
          flagBrgBekas : 'T'
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
          render: (data:any) => {
            if (data === 'Aktif') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
            render: (data: any, _: any, row: any) => {
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
        [1, 'asc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () => this.actionBtnClick(data));

        return row;
      },
    };

  }

  renderDataTablesBranch(): void {
    console.log('Running......');
    this.dtOptionsBranch = {
      language: this.translationService.getCurrentLanguage() === 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      drawCallback: (drawCallback:any) => {

        this.selectedRowDataBranch = undefined;
      },
      ajax: (dataTablesParameters: any, callback:any) => {
        console.log('Sending AJAX request...', dataTablesParameters);
        this.pageBranch.start = dataTablesParameters.start;
        this.pageBranch.length = dataTablesParameters.length;

        const params = {
          ...dataTablesParameters,
          status :''
        };

        this.dataService
          .postData(this.config.BASE_URL + '/api/supplier/dt', params)
          .subscribe((resp: any) => {
            console.log('Response from backend:', resp);

            const mappedData = resp.data.map((item: any, index: number) => {
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                kodeKeteranganRsc: `${rest.kodeRsc} - ${rest.keteranganRsc}`,
                dtIndex: this.page.start + index + 1,
              };
              return finalData;
            });

            this.pageBranch.recordsTotal = resp.recordsTotal;
            this.pageBranch.recordsFiltered = resp.recordsFiltered;

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'kodeSupplier', title: 'Kode', searchable: true },
        { data: 'namaSupplier', title: 'Nama Supplier', searchable: true },
        {
          data: 'alamat1',
          title: 'Alamat',
          searchable: true,
          render: (data: any, type: any, row: any): string => {
            const alamat1 = row.alamat1 ?? '';
            const alamat2 = row.alamat2 ?? '';
            const alamatGabungan = [alamat1, alamat2].filter(item => item.trim() !== '').join(', ');
        
            // Kalau proses search/filter/sort, DataTables butuh plain text
            if (type === 'filter' || type === 'sort') {
              return alamatGabungan;
            }
        
            // Kalau proses display (render ke tampilan)
            return `<div>${alamatGabungan}</div>`;
          }
        },        
        { data: 'keteranganKota', title: 'Kota', searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data:any) => {
            return data === 'A'
              ? `<div class="d-flex justify-content-center"><span class="badge badge-success py-2" style="color:white; background-color:#2eb85c; width:60px">Active</span></div>`
              : `<div class="d-flex justify-content-center"><span class="badge badge-secondary py-2" style="background-color:grey; width:60px">Inactive</span></div>`;
          },
        },
        {
          title: 'Action',
            render: (data: any, _: any, row: any) => {
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
      searchDelay: 1500,
      order: [
        [1, 'asc']
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () => this.actionBtnClickBranch(data));
        return row;
      },
    };
  }

    private mapOrderData(data: any): void {
      this.myForm.patchValue({
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        satuanHasilProduksi: data.konversi,
        labelSatuanHasilProduksi: data.satuanKecil+"/"+data.satuanBesar,
      })
    }

    calculateTotalHasilProduksi(): void {
      const jumlahHasilProduksi = this.myForm.get('jumlahHasilProduksi')?.value;
      const satuanHasilProduksi = this.myForm.get('satuanHasilProduksi')?.value;

      if (jumlahHasilProduksi && satuanHasilProduksi) {
        const totalHasilProduksi = jumlahHasilProduksi * satuanHasilProduksi;
        this.myForm.patchValue({
          totalHasilProduksi: totalHasilProduksi
        });
      }
    }

    onBatalPressed(newItem: any): void {
      const todayDate = new Date();
      this.defaultDate = this.helperService?.formatDate(todayDate);
      this.myForm.reset({
        kodeBarang: '',
        namaBarang: '',
        satuanHasilProduksi: '',
        tglTransaksi: this.defaultDate,  // Assign default date to tglTransaksi
        jumlahHasilProduksi: '',
        keterangan: '',
        tglExp: this.defaultDate,  // Assign default date to tglExp
        totalHasilProduksi: '',
        labelSatuanHasilProduksi: '',
        totalBahanBaku: 0,
      });
      this.isShowDetail = false;
      console.log('newItem :', newItem)
      if (newItem) this.onShowModalPrint(newItem);
    }

    addJumlahBahanBaku($event:any): void {
        this.myForm.patchValue({
          totalBahanBaku: $event
        });
    }

    formatDate(date: string | Date): string {
      if (typeof date === 'string') {
        const [day, month, year] = date.split('/').map(Number);
        date = new Date(year, month - 1, day); // Bulan dalam JavaScript dimulai dari 0
      }
      return this.datePipe?.transform(date, 'dd/MM/yyyy') || '';
    }

    onShowModalBranch() {
      this.isShowModalBranch= true;
    }

    specialCharValidator(control: AbstractControl): ValidationErrors | null {
        const specialCharRegex = /[^a-zA-Z0-9&\-().\s]/;
        const value = control.value;
        if (value && specialCharRegex.test(value)) {
          return { specialCharNotAllowed: true };
        }
        return null;
      }

      onKeteranganInput(event: Event): void {
        const input = event.target as HTMLTextAreaElement;
        const originalValue = input.value;
        const filteredValue = originalValue.replace(/[^a-zA-Z0-9\s\-]/g, '');

        if (originalValue !== filteredValue) {
          input.value = filteredValue;
          this.myForm.get('keterangan')?.setValue(filteredValue);
        }
      }

      // onNoDocumentInput(event: Event): void {
      //   const input = event.target as HTMLTextAreaElement;
      //   const originalValue = input.value;
      //   const filteredValue = originalValue.replace(/[^a-zA-Z0-9\-]/g, '');

      //   if (originalValue !== filteredValue) {
      //     input.value = filteredValue;
      //     this.myForm.get('noReturnPengirim')?.setValue(filteredValue);
      //   }
      // }


      showWarningModal(message: string) {
        Swal.fire({
          title: 'Pesan Error',
          text: message,
          confirmButtonText: 'OK'
        });
      }

      closeModal() {
        this.isShowModalReport = false;
        this.disabledPrintButton = false;
      }

      onShowModalPrint(data: any) {
        this.paramGenerateReport = {
          noTransaksi: data.nomorTransaksi,
          userEntry: data.userCreate,
          jamEntry: this.globalService.transformTime(data.timeCreate),
          tglEntry: this.globalService.transformDate(data.dateCreate),
          outletBrand: 'KFC',
          kodeGudang: this.globalService.getUserLocationCode(),
          isDownloadCsv: false,
          reportName: 'Cetak kirim barang retur ke Supplier',
          confirmSelection: 'Ya',
        };
        this.isShowModalReport = true;
      }


}










