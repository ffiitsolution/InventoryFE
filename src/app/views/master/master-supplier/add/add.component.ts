import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_SUPPLIER } from 'src/constants';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class MasterSupplierAddComponent implements OnInit {
  myForm: FormGroup;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {

    this.myForm = this.form.group({
      code:  ['', Validators.required],
      name:  ['', Validators.required],
      warehouse: ['', Validators.required],
      address1: ['', Validators.required],
      address2: [''],
      city: [''],
      cityDesc: [''],
      pos: [''],
      telephone1: [''],
      telephone2: [''],
      contactPerson: [''],
      phone: [''],
      fax1: [''],
      fax2: [''],
      email: [''],
      warehouseDesc: [''],
      rsc: [''],
      rscDesc: [''],
      status: [''],
      desc: [''],
      cad1: [''],
      cad2: [''],
    });
    
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SUPPLIER);
    this.router.navigate(['/master/master-supplier']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-supplier/edit']);
  }
}
