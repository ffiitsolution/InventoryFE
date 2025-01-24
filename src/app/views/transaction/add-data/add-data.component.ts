import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
})
export class AddDataComponent implements OnInit, AfterViewInit, OnDestroy {
orderNumber: any;
  // validatedDeliveryDate method removed to fix duplicate implementation error
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;

  // Form data object
  formData = {
    orderNumber: '',
    deliveryStatus: '',
    deliveryDestination: '',
    destinationAddress: '',
    orderDate: '',
    deliveryDate: '',
    expirationDate: '',
    validatedDeliveryDate: '',
    notes: '',

  };

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private deliveryDataService: DeliveryDataService
  ) {}

  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/delivery-item']);
  }
  
  onSaveData(): void {
    const today = new Date().toISOString().split('T')[0];
    this.formData.validatedDeliveryDate = today;

    console.log('Data yang akan disimpan:', this.formData);
    this.deliveryDataService.saveDeliveryData(this.formData).subscribe(
      (response: any) => {
        console.log('Data saved successfully:', response);
      },
      (error: any) => {
        console.error('Error saving data:', error);
      }
    );
  }

  searchOrderNumber(): void {
    if (this.formData.orderNumber) {
      console.log('Searching for order number:', this.formData?.orderNumber);

      this.dataService.searchOrder(this.formData.orderNumber).subscribe(
        (response: any) => {
          console.log('Order found:', response);
          this.mapOrderData(response);
        },
        (error: any) => {
          console.error('Error searching for order number', error);
        }
      );
    } else {
      console.error('Order number is required.');
    }
  }

  private mapOrderData(orderData: any): void {
    this.formData.deliveryStatus = orderData.deliveryStatus || '';
    this.formData.deliveryDestination = orderData.deliveryDestination || '';
    this.formData.destinationAddress = orderData.destinationAddress || '';
    this.formData.orderDate = orderData.orderDate || '';
    this.formData.deliveryDate = orderData.deliveryDate || '';
    this.formData.expirationDate = orderData.expirationDate || '';
    this.formData.notes = orderData.notes || '';
    console.log('Form data updated:', this.formData);
  }

  // notes(event: Event): void {
  //   const target = event.target as HTMLInputElement; // Type assertion
  //   console.log('Notes changed:', target.value);
  //   this.formData.notes = target.value; // Update nilai
  // }

  validatedDeliveryDate(event: Event): void {
    const target = event.target as HTMLInputElement; // Type assertion
    console.log('Validated delivery date changed:', target.value);
    this.formData.validatedDeliveryDate = target.value; // Update nilai
  }
}
@Injectable({
  providedIn: 'root',
})
export class DeliveryDataService {
  constructor(private http: HttpClient) {}

  saveDeliveryData(data: any): Observable<any> {
    const apiUrl = 'your-api-endpoint'; // Replace with your actual API endpoint
    return this.http.post<any>(apiUrl, data);
  }
}









