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
  ACTION_SELECT,
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
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-data-detail-resep',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailResepComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  headerResep: any = JSON.parse(
    localStorage['headerResep']
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
  listResepData: any[] = [];
  listEntryExpired: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page = new Page();
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
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
  };
  protected config = AppConfig.settings.apiServer;
  selectedRowData: any;
  currentSelectedForModal: number;
  loadingSimpan: boolean = false;
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
    this.headerResep = JSON.parse(this.headerResep);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Resep') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');
    const isCanceled = this.headerResep.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
    this.headerResep.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.listResepData = [
      { 
        kodeBarang: '',
        namaBarang: '', 
        konversi: '', 
        satuanKecil: '',
        satuanBesar: '', 
        qtyPemakaian: '',
        status: '' 
      }
    ];

    this.loadResep();
    this.renderDataTables()

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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();  
  }

  onBackPressed() {
    this.router.navigate(['/master/master-resep']);
  }



  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.listResepData
            .filter(item => item.kodeBarang && item.kodeBarang.trim() !== '')
            .map(item => ({
              kodeGudang: this.g.getUserLocationCode(),
              kodeResep: this.headerResep.kodeBarang,
              bahanBaku: item.kodeBarang,
              namaBarang: item.namaBarang,
              konversi: item.konversi,
              qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2),
              satuanKecil: item.satuanKecil,
              satuanBesar: item.satuanBesar,
              userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
            })),
      };

      Swal.fire({
            title: 'Apakah anda sudah yakin?',
            text: 'PASTIKAN DATA YANG DI INPUT SUDAH BENAR..!!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Proses Simpan',
            cancelButtonText: 'Batal Simpan',
          }).then((result) => {
            if (result.isConfirmed) {
              this.service.insert('/api/resep/insert', param)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (res) => {
                  if (!res.success) {
                    this.toastr.error(res.message);
                  } else {
                    setTimeout(() => {
                      this.toastr.success("Data production berhasil disimpan!");
                      this.onPreviousPressed();
                    }, DEFAULT_DELAY_TIME);
        
                  }
                  this.adding = false;
                  this.loadingSimpan = false;
                },
                error:()=>{
                  this.loadingSimpan = false;
                }
              });
            } else {
              this.toastr.info('Posting dibatalkan');
              this.loadingSimpan = false;
            }
          });

    }

    else {
      this.toastr.error("Data Qty Pemakaian harus sama dengan Qty Expired");
    }

  }

  isDataInvalid(): boolean {
    if(this.validationMessageList.length > 0 ){
      return this.validationMessageList.some(message => message !== '');
    }else{
      return true;
    }
   
  }
  

  onShowModal(index:number) {
    this.isShowModal = true;
    this.currentSelectedForModal = index
  }

  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }

 

  updateKeteranganTanggal(item: any) {
    item.keteranganTanggal = moment(item.tglExpired).locale('id').format('D MMMM YYYY');
  }
  

  get filteredList() {
    return this.listEntryExpired.filter(item => item.kodeBarang === this.selectedExpProduct.bahanBaku);
  }


  onPreviousPressed(): void {
    this.router.navigate(['/master/master-resep']);
  }

  


  loadResep() {
    let param = this.headerResep?.kodeBarang;
    this.appService.getBahanBakuByResep(param)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res) => {

          this.validationMessageList = new Array(res.length).fill('');

          this.listResepData = res.data.map((item: any) => ({
            kodeBarang: item.bahanBaku,
            namaBarang: item.namaBarang,
            konversi: parseFloat(item.konversi).toFixed(2),
            qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2) ,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            kodeResep: item.kodeResep,
            status: item.status
          }));

        
          
         if(this.listResepData.length === 0){
          this.listResepData = [
            { 
              kodeBarang: '',
              namaBarang: '', 
              konversi: '', 
              satuanKecil: '',
              satuanBesar: '', 
              qtyPemakaian: '1.00',
              status: ''
            }
          ];
         }  
      },
    });
  }

  onAdd(){
    this.listResepData.push(
      { 
        kodeBarang: '',
        namaBarang: '', 
        konversi: '', 
        satuanKecil: '',
        satuanBesar: '', 
        qtyPemakaian: '1.00',
        status: ''
      }
    )
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
      order: [
        [6, 'asc']      ],
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
        this.appService.getBahanBakuList(params)
          .pipe(takeUntil(this.ngUnsubscribe))
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
          { 
            data: 'konversi', 
            title: 'Konversi', 
            render: function(data, type, row) {
              return Number(data).toFixed(2); // Ensures two decimal places
            }
          },
          { data: 'satuanBesar', title: 'Satuan Besar', },
          { data: 'satuanKecil', title: 'Satuan Kecil' },
          { data: 'defaultGudang', title: 'Default Gudang', },
          {
            data: 'status',
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
            orderable: false,
            render: (data, type, row) => {
              const disabled = row.status !== 'Aktif' ? 'disabled' : '';
              return `<button class="btn btn-sm action-select btn-info btn-80 text-white" ${disabled}>Pilih</button>`;
            },
          },
  
        ],
        searchDelay: 1000,
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.action-select', row).on('click', () =>
            this.onPilihBarang(data)
          );
          
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

    actionBtnClick(action: string, data: any = null) {
      this.selectedRowData = JSON.stringify(data);
      this.renderDataTables();
      this.isShowModal = false;
     
    }

    onPilihBarang(data: any) {
      let errorMessage;
      this.isShowModal = false;
    
  
      const existingItemIndex = this.listResepData.findIndex(
        (item) => item.kodeBarang === data.kodeBarang
      );
    
      if (existingItemIndex === -1) {
        const resepData = { 
          kodeBarang: data.kodeBarang,
          namaBarang: data.namaBarang, 
          konversi: parseFloat(data.konversi).toFixed(2), 
          satuanKecil: data.satuanKecil,
          satuanBesar: data.satuanBesar, 
          qtyPemakaian: '1.00',
          status: data.status,
        };
    
      
        this.listResepData[this.currentSelectedForModal] = resepData; 
      
      } else {
        // If item already exists in the list
        errorMessage = 'Barang sudah ditambahkan';
      }
    
      // Show error if there was an issue
      if (errorMessage) {
        this.toastr.error(errorMessage);
      }
    }
    

    onInputValueItemDetail(
      event: any,
      index: number,
    ) {

        let value = event.target.value;

        if (value !== null && value !== undefined) {
          let numericValue = parseFloat(value.toString().replace(',', '.'));
          if (isNaN(numericValue)) {
              numericValue = 0;
          }
          value = numericValue.toFixed(2);
        } else {
          value = "0.00"; // Default if empty
        }

        if(value <= 0){
          this.validationMessageList[index] = "Quantity tidak boleh <= 0"
        }else{
          this.validationMessageList[index] ="";
        }

        this.listResepData[index].qtyPemakaian = value;
    }

    onDeleteRow(index: number,data:any) {
      // Remove item at the specified index
      if(data.kodeResep){
        const params = {
            kodeResep:data.kodeResep,
            bahanBaku:data.kodeBarang
        };
        Swal.fire({
          title: 'Apakah anda yakin ingin menghapus data ini?',
          text: '',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Proses Hapus',
          cancelButtonText: 'Batal Hapus',
        }).then((result) => {
          if (result.isConfirmed) {
            this.service.deleteResepRow(params)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                } else {
                  setTimeout(() => {
                    this.toastr.success("Data resep berhasil dihapus!");
                    // this.onPreviousPressed();
                    this.loadResep()
                  }, DEFAULT_DELAY_TIME);
      
                }
                this.adding = false;
              },
            });
          } else {
            this.toastr.info('Hapus dibatalkan');
          }
        });
      }else{
        this.listResepData.splice(index, 1);
      }

      this.validationMessageList.splice(index,1)
     
    }

    getProductRow(kodeBarang: string, index: number) {
     
      if (kodeBarang !== '') {
        const isDuplicate = this.listResepData.some(
          (item, i) => item.kodeBarang === kodeBarang && i !== index
        );
  
        if (isDuplicate) {
          this.toastr.error('Barang sudah ditambahkan');
          return;
        }
  
        this.appService.getProductResep(kodeBarang)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            if (res) {
              const resepData = { 
                kodeBarang: res.kodeBarang,
                namaBarang: res.namaBarang, 
                konversi: res.konversi, 
                satuanKecil: res.satuanKecil,
                satuanBesar: res.satuanBesar, 
                qtyPemakaian: res.qtyPemakaian,
                status: res.status, 
              };
          
            
              this.listResepData[index] = resepData; 
            }
          },
          error: (err) => {
            // Handle error case and show error toast
            this.toastr.error('Kode barang tidak ditemukan!');
          }
        });
      }
    }

    handleEnter(event: any, index: number) {
      event.preventDefault();
  
      let kodeBarang = this.listResepData[index].kodeBarang?.trim();
      if (kodeBarang !== '') {
        this.getProductRow(kodeBarang, index);
      }
    }
}    