import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_AREA } from 'src/constants';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class TableAreaDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_AREA));
    this.myForm = this.form.group({
      code: [this.detail.kodeArea],
      desc: [this.detail.keteranganArea],
      dateCreate: [{ value: this.detail.dateCreate, disabled: true }],
      userCreate: [{ value: this.detail.userCreate, disabled: true }],
      userUpdate: [{ value: this.detail.userUpdate, disabled: true }],
      dateUpdate: [{ value: this.detail.dateUpdate, disabled: true }],
    });
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_AREA);
    this.router.navigate(['/master/master-area']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-area/edit']);
  }
}
