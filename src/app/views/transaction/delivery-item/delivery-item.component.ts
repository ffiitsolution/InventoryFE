import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { Subject } from 'rxjs';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'app-delivery-item',
  templateUrl: './delivery-item.component.html',
  styleUrls: ['./delivery-item.component.scss'],
})

export class DeliveryItemComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  showFilterSection: boolean = false;
  statusFilter: string = '';
  selectedStatusFilter: string = '';
  dateRangeFilter: any;
  orderNumbers: any[] = [];
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
    };

    // Fetch order numbers (dummy data for example)
    this.orderNumbers = [
      { orderNo: '001', orderDate: '2023-01-01', deliveryDate: '2023-01-05', expired: '2023-01-10', customer: 'John Doe', customerName: 'John', print: true, orderStatus: 'Dikirim' },
      { orderNo: '002', orderDate: '2023-01-02', deliveryDate: '2023-01-06', expired: '2023-01-11', customer: 'Jane Doe', customerName: 'Jane', print: false, orderStatus: 'Tertunda' },
      // Add more orders as needed
    ];
  }

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    // Logic for adding a new order
    const route = this.router.createUrlTree(['/transaction/add-data']);
    this.router.navigateByUrl(route);
  }

  onFilterStatusChange(): void {
    // Logic for handling status filter change
    console.log('Status filter changed:', this.selectedStatusFilter);
  }

  onFilterOrderNoChange(event: Event): void {
    // Logic for handling order number filter change
    if (event) {
      const target = event.target as HTMLInputElement | null;
      if (target) {
        this.orderNoFilter = target.value; // Update nilai filter
      }
    }
  }

  onFilterOrderDateChange(event?: Event): void {
    // Logic for handling order date filter change
    if (event) {
      const target = event.target as HTMLInputElement | null;
      if (target) {
        this.orderDateFilter = target.value; // Update nilai filter
      }
    }
  }

  onFilterExpiredChange(): void {
    // Logic for handling expired date filter change
    console.log('Expired filter changed:', this.expiredFilter);
  }

  onFilterTujuanChange(): void {
    // Logic for handling tujuan filter change
    console.log('Tujuan filter changed:', this.tujuanFilter);
  }

  onFilterPressed(): void {
    // Logic for applying filters
    console.log('Filter pressed');
  }

  dpConfig() {
    return {
      containerClass: 'theme-default',
    };
  }

  dtPageChange(event: any): void {
    console.log('Page changed', event);
    // Logic for handling page change
    // You can fetch new data based on the page number or perform other actions
  }

  validateDeliveryDate(): void {
    const today = new Date();
    this.orderNumbers.forEach(order => {
      const deliveryDate = new Date(order.deliveryDate);
      const timeDiff = Math.abs(today.getTime() - deliveryDate.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (diffDays > 7) {
        console.warn(`Order ${order.orderNo} has a delivery date older than 7 days.`);
      }
    });
  }
}