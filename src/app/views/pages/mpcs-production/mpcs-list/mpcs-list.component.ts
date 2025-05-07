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
  protected config = AppConfig.settings.apiServer;
  currentDate: Date = new Date();
  selectedRowData: any;
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  selectedStatusFilter: any = '';
  isFilterShown: boolean = false;
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
  ) {
    translate.use(g.getLocalstorage('inv_language') || 'id');
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    // this.dpConfig.minDate = new Date();
    this.dpConfig.customTodayClass='today-highlight';
    this.dpConfig.isDisabled = true;
  
  }
  myForm: FormGroup;

  ngOnInit(): void {
    const todayDate = new Date();
    this.defaultDate = this.helperService.formatDate(todayDate);

    

    this.getDataProduction();
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
    const params = {
      start: this.currentPage*this.itemsPerPage || 0,
      search: { value: this.searchText,regex:false },
      length: this.itemsPerPage || 15,
      order: [{column: 1, dir: "desc"}, {column: 2, dir: "desc"}],
      ...this.paramaters ,
      draw:this.draw,
      kodeGudang: this.g.getUserLocationCode(),
      statusPosting: this.selectedStatusFilter,
      startDate: moment(this.dateRangeFilter[0]).set({
                  hours: 0,
                  minutes: 0,
                  seconds: 0,
                  milliseconds: 0,
                }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
      endDate: moment(this.dateRangeFilter[1]).set({
                  hours: 23,
                  minutes: 59,
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
 
}
