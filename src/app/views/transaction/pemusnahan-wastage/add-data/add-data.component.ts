import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Page } from '../../../../model/page';
import { AppService } from '../../../../service/app.service';
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../../constants';
import moment from 'moment';

@Component({
  selector: 'app-add-wastage',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],

})
export class AddWastageComponent implements OnInit, AfterViewInit, OnDestroy {
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRo: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  configSelectUser: any;
  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name' // Key to search
  };

  listUser: any[] = [];
  @ViewChild('formModal') formModal: any;
  // Form data object
  formData = {
    namaSaksi: '',
    jabatanSaksi: '',
    keterangan: '',
    tglTransaksi: moment(new Date(), 'YYYY-MM-DD').format('DD-MM-YYYY') || '',
  };

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService,
    private appService: AppService
  ) { 
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
  }



  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );
    this.dpConfig.customTodayClass = 'today-highlight';

    const today = new Date().toISOString().split('T')[0];
    this.minDate = new Date(today);
    this.maxDate = new Date(today);
    
    this.getDropdownUser();
    this.configSelectUser = {
      ...this.baseConfig,
      placeholder: 'Pilih User',
      searchPlaceholder: 'Cari User',
      limitTo: this.listUser.length
    };
  }

  getDropdownUser(): void{
    const param = {
      defaultLocation: this.globalService.getUserLocationCode()
    };
    this.dataService
      .postData(this.globalService.urlServer + '/api/dropdown-user', param)
      .subscribe((resp: any) => {
        this.listUser = resp.map((item: any) => ({
          name: item.namaUser,
          jabatan: item.jabatan
        }));
      });
  }

  onUserChange(event: any){
    const value = event.value;
    this.formData.namaSaksi = value.name;
    this.formData.jabatanSaksi = value.jabatan;
  }

  onAddDetail() {
    this.formData.tglTransaksi = moment(this.formData.tglTransaksi, 'YYYY-MM-DD').format('DD-MM-YYYY') || '';

    this.globalService.saveLocalstorage(
      'headerWastage',
      JSON.stringify(this.formData)

    );
    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return Object.values(this.formData).some(value => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage(
      'headerWastage',
    );
  }


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/delivery-item']);
  }

  onShowModal() {
    this.isShowModal = true;
  }


}
@Injectable({
  providedIn: 'root',
})
export class DeliveryDataService {
  constructor(private http: HttpClient) { }

  saveDeliveryData(data: any): Observable<any> {
    const apiUrl = 'http://localhost:8093/inventory/api/delivery-order/status-descriptions';
    return this.http.post<any>(apiUrl, data);
  }
}









