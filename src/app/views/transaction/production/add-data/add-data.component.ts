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
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../../constants';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';

@Component({
  selector: 'app-add-production',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],

})
export class AddProductionComponent implements OnInit, AfterViewInit, OnDestroy {
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
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
  selectedRowData: any;
  defaultDate: any ;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @ViewChild('formModal') formModal: any;
  // Form data object


  constructor(
    private router: Router,
    private helperService: HelperService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private form: FormBuilder,
    private appService: AppService
  ) {
    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.minDate = new Date();
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
          kodeBarang: ['', [Validators.required]],
          namaBarang: ['', [Validators.required]],
          satuanHasilProduksi: ['', [Validators.required]],
          tglTransaksi: [this.defaultDate, [Validators.required]],
          jumlahHasilProduksi: ['', [Validators.required,Validators.min(1)]],
          keterangan: [''],
          tglExp:[this.defaultDate, [Validators.required]],
          totalHasilProduksi: ['', [Validators.required,Validators.min(1)]],
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

    this.renderDataTables()
   
  }

  onAddDetail() {
    this.globalService.saveLocalstorage(
      'headerProduction',
      JSON.stringify(this.myForm.value)
    );

    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return true
    // return Object.values(this.formData).some(value => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
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


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/production/list-dt']);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRow = JSON.stringify(data);
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
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
        };
        this.appService.getProductionProductList(params)
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
        { data: 'kodeBarang', title: 'Kode' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'satuanBesar', title: 'Satuan Besar', },
        { data: 'defaultGudang', title: 'Default Gudang', },
        { data: 'status', title: 'Status', },
        {
          title: 'Action',
          render: () => {
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white">Pilih</button>`;
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
      this.defaultDate = this.helperService.formatDate(todayDate);
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

}










