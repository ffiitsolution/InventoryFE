import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { Subject } from 'rxjs';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'app-delivery-item',
  templateUrl: './delivery-item.component.html',
  styleUrls: ['./delivery-item.component.scss'],
})
export class DeliveryItemComponent {
  dtPageChange($event: Event) {
    throw new Error('Method not implemented.');
  }
  dtOptions: ADTSettings;
  dtTrigger: Subject<ADTSettings>;
  onStatusFilterChange() {
    throw new Error('Method not implemented.');
  }
  CONST_ACTION_ADD: any;
  isFilterShown: BooleanInput;
  selectedStatusFilter: any;
  actionBtnClick(arg0: any) {
    throw new Error('Method not implemented.');
  }
  toggleFilter() {
    throw new Error('Method not implemented.');
  }
  onAddPressed() {
    throw new Error('Method not implemented.');
  }
  showFilterSection() {
    throw new Error('Method not implemented.');
  }
  statusFilter() {
    throw new Error('Method not implemented.');
  }
  onFilterStatusChange() {
    throw new Error('Method not implemented.');
  }
  dpConfig() {
    return {
      minDate: new Date(2000, 0, 1),
      maxDate: new Date(),
      dateFormat: 'dd/MM/yyyy',
      showWeeks: false,
      startingDay: 0,
      initDate: new Date(),
      yearRange: 20,
      datepickerMode: 'day',
      format: 'dd/MM/yyyy',
      showOtherMonths: true,
      selectOtherMonths: true,
      daysOfWeekDisabled: [0, 6],
      allowMultiSelect: true,
      numberOfMonths: 2,
      timepicker: false,
      onSelect: (date: any) => {
        console.log('onSelect', date);
      },
      onOpen: (date: any) => {
        console.log('onOpen', date);
      },
      onClose: (date: any) => {
        console.log('onClose', date);
      },
    };
  }

  bsConfig() {
    return {
      containerClass: 'theme-default',
    };
  }

  dateRangeFilter: any;

  onFilterPressed(): void {
    throw new Error('Method not implemented.');
  }
}