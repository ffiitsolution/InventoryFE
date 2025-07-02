import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_RUTE } from 'src/constants';

@Component({
  selector: 'app-detail-rute',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class TableRuteDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_RUTE));
    this.myForm = this.form.group({
      code: [this.detail.kodeUom],
      desc: [this.detail.keteranganUom],
      dateCreate: [{ value: this.detail.dateCreate, disabled: true }],
      userCreate: [{ value: this.detail.userCreateName, disabled: true }],
      userUpdate: [{ value: this.detail.userUpdateName, disabled: true }],
      dateUpdate: [{ value: this.detail.dateUpdate, disabled: true }],
    });
    this.myForm.disable();
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_RUTE);
    this.router.navigate(['/master/master-rute']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-rute/edit']);
  }
}
