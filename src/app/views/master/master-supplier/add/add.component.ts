import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_SUPPLIER));
    this.myForm = this.form.group({
      code: [this.detail.kodeSupplier],
      name: [this.detail.namaSupplier],
      address1: [this.detail.alamat1],
      address2: [this.detail.alamat2],
      city: [this.detail.kota],
      cityDesc: [this.detail.keteranganKota],
      pos: [this.detail.kodePos],
      telephone1: [this.detail.telpon1],
      telephone2: [this.detail.telpon2],
      contactPerson: [this.detail.contactPerson],
      phone: [this.detail.contactPhone],
      fax1: [this.detail.fax1],
      fax2: [this.detail.fax2],
      email: [this.detail.alamatEmail],
      warehouse: [this.detail.defaultGudang],
      warehouseDesc: [this.detail.keteranganGudang],
      rsc: [this.detail.kodeRsc],
      rscDesc: [this.detail.keteranganRsc],
      status: [this.detail.statusAktif],
      desc: [this.detail.keterangan],
      cad1: [this.detail.cad1],
      cad2: [this.detail.cad2],
      dateCreate: [{ value: this.detail.dateCreate, disabled: true }],
      userCreate: [{ value: this.detail.userCreate, disabled: true }],
      userUpdate: [{ value: this.detail.userUpdate, disabled: true }],
      dateUpdate: [{ value: this.detail.dateUpdate, disabled: true }],
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
