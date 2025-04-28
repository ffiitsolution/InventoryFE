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


@Component({
  selector: 'app-add-terima-barang-retur-dari-site',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
  providers: [DatePipe]

})
export class AddTerimaBarangReturDariSiteComponent implements OnInit, AfterViewInit, OnDestroy {
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
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
  dtOptionsBranch: DataTables.Settings = {};
  selectedRowDataBranch: any;
  pageBranch = new Page();
  

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
    noReturnPengirim : string;
    namaTujuan: string;
    alamatTujuan: string;
    statusTujuan: string;
    keterangan: string;
    tglTransaksi?: Date;
  } = {
    kodeTujuan: '',
    noReturnPengirim: '',
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
          noReturnPengirim:['', [Validators.required]],
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
    this.formData.kodeTujuan = data?.outletCode;
    this.formData.tglTransaksi = data?.dateReturn ? new Date(data.dateReturn) : undefined;
    this.formData.namaTujuan = data?.namaPengirim;
    this.formData.alamatTujuan = data?.alamatPengirim;
    this.formData.statusTujuan = data?.statusAktif;
    this.formData.noReturnPengirim = data?.returnNo;
    this.isShowModal = false;
  }


  actionBtnClickBranch(data: any = null) {
    this.formData.kodeTujuan = data?.kodeCabang;
    this.formData.namaTujuan = data?.namaCabang;
    this.formData.alamatTujuan = data?.alamat1;
    this.formData.statusTujuan = this.getStatusAktifText(data?.statusAktif);
    this.isShowModalBranch = false;
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
    this.myForm.controls['noReturnPengirim'].setValue("");   
    this.myForm.controls['satuanHasilProduksi'].setValue("");  
    this.myForm.controls['keterangan'].setValue("");  
  }

  mappingDataPemesan(data : any) {
    this.myForm.controls['kodeBarang'].setValue(data.outletCode);
    this.myForm.controls['namaBarang'].setValue(data.namaPengirim);  
    this.myForm.controls['tglTransaksi'].setValue(data.dateReturn ? new Date(data.dateReturn) : null);
    if (data.statusAktif.trim() === 'Aktif') {
      this.myForm.controls['satuanHasilProduksi'].setValue("A");
    }  
    else if(data.statusAktif.trim() === 'Tidak Aktif'){
      this.myForm.controls['satuanHasilProduksi'].setValue("T");
    }
    else {
      this.myForm.controls['satuanHasilProduksi'].setValue(data.statusAktif);
    }
    this.myForm.controls['alamatPengirim'].setValue(data.alamatPengirim);  
    this.myForm.controls['noReturnPengirim'].setValue(data.returnNo);
    // this.myForm.controls['kodeBarang'].setValue(data.kodeCabang);
    // this.myForm.controls['namaBarang'].setValue(data.namaCabang);
    // this.myForm.controls['alamatPengirim'].setValue(data.alamat1);  
    // if (data.statusAktifLabel.trim() === 'Aktif') {
    //   this.myForm.controls['satuanHasilProduksi'].setValue("Aktif");
    // }  
    // else if(data.statusAktifLabel.trim() === 'Tidak Aktif'){
    //   this.myForm.controls['satuanHasilProduksi'].setValue("Tidak Aktif");
    // }
    // else {
    //   this.myForm.controls['satuanHasilProduksi'].setValue(data.statusAktifLabel);
    // }       
  }


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/terima-barang-retur-dari-site/list-dt']);
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
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
          status: 'K'
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
      drawCallback: (drawCallback) => {
        
        this.selectedRowDataBranch = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        console.log('Sending AJAX request...', dataTablesParameters);
        this.pageBranch.start = dataTablesParameters.start;
        this.pageBranch.length = dataTablesParameters.length;
  
        const params = {
          ...dataTablesParameters,
        };
  
        this.dataService
          .postData(this.config.BASE_URL + '/api/branch/dt', params)
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
        { data: 'kodeCabang', title: 'Kode', searchable: true },
        { data: 'namaCabang', title: 'Nama', searchable: true },
        { data: 'keteranganRsc', title: 'RSC', searchable: true },
        { data: 'kota', title: 'Kota', searchable: true },
        { data: 'deskripsiGroup', title: 'Group', searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data) => {
            return data === 'A'
              ? `<div class="d-flex justify-content-center"><span class="badge badge-success py-2" style="color:white; background-color:#2eb85c; width:60px">Active</span></div>`
              : `<div class="d-flex justify-content-center"><span class="badge badge-secondary py-2" style="background-color:grey; width:60px">Inactive</span></div>`;
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
      searchDelay: 1500,
      order: [
        [1, 'asc'],
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
        const filteredValue = originalValue.replace(/[^a-zA-Z0-9\-]/g, '');
        
        if (originalValue !== filteredValue) {
          input.value = filteredValue;
          this.myForm.get('keterangan')?.setValue(filteredValue);
        }
      }


      showWarningModal(message: string) {
        Swal.fire({
          title: 'Pesan Error',
          text: message,
          confirmButtonText: 'OK'
        });
      }
      

}










