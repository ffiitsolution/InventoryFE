import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../../service/app.service';
import { isEmpty } from 'lodash-es';
import { environment } from '../../../../../environments/environment';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { TranslationService } from '../../../../service/translation.service';
import { GlobalService } from '../../../../service/global.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../../model/page';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';
import { DataService } from '../../../../service/data.service';
import { AppConfig } from '../../../../config/app.config';
import moment from 'moment';
import { DEFAULT_DATE_RANGE_RECEIVING_ORDER } from '../../../../../constants';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-mpcs-list',
  templateUrl: './mpcs-list.component.html',
  styleUrls: ['./mpcs-list.component.scss'],
})
export class MpcsListComponent implements OnInit {
  @ViewChild('usernameInput')
  usernameInput: ElementRef | undefined;

  @ViewChild('passwordInput')
  passwordInput: ElementRef | undefined;
  loadingSimpan: boolean = false;
  translate: string = 'id';
  redirectUrl: string = '';
  logingIn: boolean = false;
  searchingUsername: boolean = false;
  errorMessage: string = '';
  defaultGudang: string = '';
  subscription$: any;
  version: string = environment.VERSION;
  private usernameSubject = new Subject<string>(); // Subject untuk debounce
  passwordVisible: boolean = false;
  loadingUser: boolean = false;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  bsConfig: Partial<BsDatepickerConfig>;
  isShowRecipe: boolean = false;
  page = new Page();
  paramaters = {};
  defaultDate: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  searchText: string ='';
  draw:any =1;
  totalItems = 0;
  itemsPerPage = 15;
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];
  listProductionData: any = [];
  listSummaryData: any = [];
  protected config = AppConfig.settings.apiServer;
  currentDate: Date = new Date();
  selectedRowData: any;
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  selectedStatusFilter: any = 'B';
  isFilterShown: boolean = true;
  startTime: string = '09:00';
  endTime: string = '18:00';
  isShowModalKirim: boolean = false;
  totalTransSummary: number = 0;
  loadingKirim: boolean = false;
  protected configGudang = '';
  isShowWarehouseModal = false;
  selectedWarehouse: string | null = null;
  dataUser: any = {};
  constructor(
    translate: TranslateService,
    private route: ActivatedRoute,
    private translation: TranslationService,
    private appService: AppService,
    public g: GlobalService,
    private router: Router,
    private el: ElementRef,
    private form: FormBuilder,
    private dataService: DataService,
    private helperService: HelperService,
    private toastr: ToastrService
  ) {
    translate.use(g.getLocalstorage('inv_language') || 'id');
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    // this.dpConfig.minDate = new Date();
    this.dpConfig.customTodayClass='today-highlight';
    this.dpConfig.isDisabled = true;
    this.configGudang = this.g.mpcsDefaultGudang;
  }
  myForm: FormGroup;

  ngOnInit(): void {
    const todayDate = new Date();
    this.defaultDate = this.helperService.formatDate(todayDate);
    this.dataUser = this.g.getLocalstorage('inv_currentUser');
   
    console.log(this.dataUser, 'data user mpcs list');
    if(this.dataUser || !isEmpty(this.dataUser)){
      this.g.mpcsDefaultGudang =this.dataUser.defaultLocation.kodeLocation;
      this.configGudang = this.g.mpcsDefaultGudang;
      this.g.mpcsJenisGudang = this.dataUser.defaultLocation.kodeSingkat;
      this.g.mpcsDefaultNamaGudang = this.dataUser.defaultLocation.kodeSingkat == 'PRD' ? 'Production' : this.dataUser.defaultLocation.kodeSingkat == 'COM' ? 'Commisary' : 'Dry Good';
      this.getDataProduction();
    }else{
      this.getMpcsDefaultGudang();
      this.openModalWarehouse();
    }

   
  }

  
  
  blockTyping(event: Event) {
    const allowedKeys = ['Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'];
  
    if (event instanceof KeyboardEvent) {
      if (!allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
    } else {
      // For non-keyboard events like paste
      event.preventDefault();
    }
  }

  changePage(page: number) {
    if (page < 0 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.getDataProduction();
  }

  getDataProduction(){
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    const params = {
      start: this.currentPage*this.itemsPerPage || 0,
      search: { value: this.searchText,regex:false },
      length: this.itemsPerPage || 15,
      order: [{column: 1, dir: "desc"}, {column: 2, dir: "desc"}],
      ...this.paramaters ,
      draw:this.draw,
      kodeGudang: this.configGudang,
      statusPosting: [this.selectedStatusFilter],
      startDate: moment(this.dateRangeFilter[0]).set({
                  hours: startHour,
                  minutes: startMinute,
                  seconds: 0,
                  milliseconds: 0,
                }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
      endDate: moment(this.dateRangeFilter[1]).set({
                  hours: endHour,
                  minutes: endMinute,
                  seconds: 59,
                  milliseconds: 999,
                }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
      columns:  [
            { data: 'dtIndex', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'tglTransaksi', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'nomorTransaksi', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'kodeProduksi', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'barangProduksi', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'konversi', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'jumlahResep', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'totalProduksi', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'tglExp', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
            { data: 'statusPosting', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
          ],    
      };

    this.appService
    this.dataService
    .postData(this.config.BASE_URL + '/api/production/dt', params)
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

        console.log(mappedData,'mapped')

        this.listProductionData= mappedData;

        this.totalItems = resp.recordsTotal;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      });

      this.draw++;
  }
  
  specialCharValidator(control: AbstractControl): ValidationErrors | null {
    const specialCharRegex = /[^a-zA-Z0-9&\-().\s]/;
    const value = control.value;
    if (value && specialCharRegex.test(value)) {
      return { specialCharNotAllowed: true };
    }
    return null;
  }

  ngOnDestroy(): void {
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBackPressed() {
    this.isShowRecipe = false;
  }

  onFilterChange() {
    this.getDataProduction();
  }
  
  onAddPressed(): void {
    const route = this.router.createUrlTree(['/mpcs/add']);
    this.router.navigateByUrl(route);
  }

  
  actionBtnClick(data: any = null) {
      this.g.saveLocalstorage('headerMpcsProduksi', JSON.stringify(data));
      this.router.navigate(['/mpcs/add']);
  }

  toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  getSummaryData() {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    const params = {
      kodeGudang: this.configGudang,
      startDate: moment(this.dateRangeFilter[0]).set({
                  hours: startHour,
                  minutes: startMinute,
                  seconds: 0,
                  milliseconds: 0,
                }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
      endDate: moment(this.dateRangeFilter[1]).set({
                  hours: endHour,
                  minutes: endMinute,
                  seconds: 59,
                  milliseconds: 999,
                }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
    };
    this.appService
    .getSummaryKirimProduction(params)
    .subscribe((resp) => {
      this.listSummaryData = resp.data.data;
      this.totalTransSummary = resp.data.totalData;
    });
  }

  formatStartDate(): string {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
  
    return moment(this.dateRangeFilter[0]).set({
      hours: startHour,
      minutes: startMinute,
      seconds: 0,
      milliseconds: 0,
    }).format('YYYY-MM-DD HH:mm');
  }

  formatEndDate(): string {
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
  
    return moment(this.dateRangeFilter[1]).set({
      hours: endHour,
      minutes: endMinute,
      seconds: 0,
      milliseconds: 0,
    }).format('YYYY-MM-DD HH:mm');
  }
  
  formatToday(): string {
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
  
    return moment().format('YYYY-MMM-DD');
  }

  showModalKirim() {
    this.getSummaryData();
    this.isShowModalKirim = true;
  }

  onKirimData(){
      this.loadingKirim = true;
    
        const requestBody = {
          kodeGudang: this.configGudang,
          userCreate:'system'
        };
    
        Swal.fire({
          ...this.g.componentKonfirmasiKirim,
          showConfirmButton: false,
          showCancelButton: false,
          width: '600px',
          customClass: {
            popup: 'custom-popup',
          },
          allowOutsideClick: () => {
            return false; // Prevent closing
          },
          didOpen: () => {
          const submitBtn = document.getElementById(
            'btn-submit'
          ) as HTMLButtonElement;
          const cancelBtn = document.getElementById(
            'btn-cancel'
          ) as HTMLButtonElement;
 
          submitBtn?.addEventListener('click', () => {

              submitBtn.disabled = true;
              cancelBtn.disabled = true;
              Swal.close();
              this.appService.kirimProduction(requestBody).subscribe({
                next: (res: any) => {
                  if (!res.success) {
                    this.appService.handleErrorResponse(res);
                  } else {
                    this.toastr.success('Berhasil Kirim!');
                  }
                  this.loadingKirim = false;
                  Swal.close();
                  const currentUrl = this.router.url;
                  this.router.navigateByUrl('/empty', { skipLocationChange: true }).then(() => {
                    this.router.navigate([currentUrl]);
                  });
                },
                error: (err: any) => {
                  console.log('An error occurred while Kirim Data.');
                  this.loadingKirim = false;
                  submitBtn.disabled = false;
                  cancelBtn.disabled = false;
                  Swal.close();
                },
              });
            });
    
            cancelBtn?.addEventListener('click', () => {
              Swal.close();
              this.toastr.info('Kirim dibatalkan');
              this.loadingKirim = false;
            });
          },
        });
  }

   getMpcsDefaultGudang() {
  
    if(this.g.mpcsDefaultGudang){
        this.configGudang = this.g.mpcsDefaultGudang;
      switch (this.g.mpcsJenisGudang) {
        case 'COM':
          this.selectedWarehouse = 'Commisary';
          break;
        case 'PRD':
          this.selectedWarehouse = 'Production';
          break;
        case 'DRY':
          this.selectedWarehouse = 'DRY Good';
          break;
      }

    }else{
    this.appService
    .mpcsDefaultGudang({})
    .subscribe((resp) => {
        this.g.mpcsDefaultGudang = resp.data.gudangPRD;
        this.g.mpcsGudangCOM = resp.data.gudangCOM;
        this.g.mpcsGudangPRD = resp.data.gudangPRD;
        this.g.mpcsGudangDRY = resp.data.gudangDRY;
        this.selectedWarehouse = 'Production';
        this.configGudang = this.g.mpcsDefaultGudang;
      
    });
    }
     this.getDataProduction();
  }
  
  openModalWarehouse(isChange : boolean = false) {

    if(!this.g.mpcsDefaultGudang || isChange){
       this.isShowWarehouseModal = true;
    }else{
        this.configGudang = this.g.mpcsDefaultGudang;
    }
   
  }

  confirmSelectionWarehouse() {
    if (this.selectedWarehouse) {
      // Handle the selected warehouse value

       switch (this.selectedWarehouse) {
        case 'Commisary':
          this.g.mpcsJenisGudang = 'COM';
          this.g.mpcsDefaultGudang = this.g.mpcsGudangCOM;
          this.g.mpcsDefaultNamaGudang = 'Commisary';
          break;
        case 'Production':
          this.g.mpcsJenisGudang = 'PRD';
          this.g.mpcsDefaultGudang = this.g.mpcsGudangPRD;
          this.g.mpcsDefaultNamaGudang = 'Production';
          break;
        case 'DRY Good':
          this.g.mpcsJenisGudang = 'DRY';
          this.g.mpcsDefaultGudang = this.g.mpcsGudangDRY;
          this.g.mpcsDefaultNamaGudang = 'DRY Good';
          break;
      }

        this.configGudang = this.g.mpcsDefaultGudang;
      // Close modal after confirmation
      this.isShowWarehouseModal = false;
      this.getDataProduction();
    }
  }

  onCloseWarehouse() {
    this.isShowWarehouseModal = false;
  }
}
