import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_SET_NUMBER } from 'src/constants';
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class MasterUserDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;
  showPassword: boolean = false;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(
      this.g.getLocalstorage(LS_INV_SELECTED_SET_NUMBER)
    );
    console.log("this.detail", this.detail);
    this.myForm = this.form.group({
      key: [this.detail.kodeUser],
      namaUser: [this.detail.namaUser],
      kodePassword: [this.detail.kodePassword],
      statusAktif: [this.detail.statusAktif],
      keteranganLokasi: [this.detail.keteranganLokasi],
      userCreate: [this.detail.userCreate],
      userUpdate: [this.detail.userUpdate],
      dateCreate: [this.detail.dateCreate],
      dateupdate: [this.detail. ], 
    });
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
    this.router.navigate(['/master/table-set-number']);
  }

  onEditPressed() {
    this.router.navigate(['/master/table-set-number/edit']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
