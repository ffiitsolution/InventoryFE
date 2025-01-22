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

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
})
export class AddDataComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;

  orderNumber: string = '';
  deliveryDestination: string = '';
  destinationAddress: string = '';
  deliveryStatus: string = '';
  orderDate: string = '';
  deliveryDate: string = '';
  expirationDate: string = '';
  notes: string = '';
  validatedDeliveryDate: string = '';

  constructor(
    private router: Router,
    private dataService: DataService,
    private globalService: GlobalService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'DD/MM/YYYY',
      }
    );
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
    this.validatedDeliveryDate = today;

    const deliveryData = {
      orderNumber: this.orderNumber,
      deliveryDestination: this.deliveryDestination,
      destinationAddress: this.destinationAddress,
      deliveryStatus: this.deliveryStatus,
      orderDate: this.orderDate,
      deliveryDate: this.deliveryDate,
      expirationDate: this.expirationDate,
      validatedDeliveryDate: this.validatedDeliveryDate,
      notes: this.notes,
    };

    console.log('Data to be saved:', deliveryData);

    

    // this.dataService.saveDeliveryData(deliveryData).subscribe(
    //   (response: any) => {
    //     console.log('Data saved successfully', response);
    //     // Handle success response
    //   },
    //   (error: any) => {
    //     console.error('Error saving data', error);
    //     // Handle error response
    //   }
    // );
  }
}