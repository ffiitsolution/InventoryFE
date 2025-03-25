import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_LOCATION } from 'src/constants';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class MasterLocationDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_LOCATION));
    this.myForm = this.form.group({
      code: [this.detail.kodeLocation],
      intial: [this.detail.kodeInisial],
      desc: [this.detail.keteranganLokasi],
      location: [this.detail.lokasiGudang],
      codeRsc: [this.detail.defaultRsc],
      descRsc: [this.detail.keteranganRsc],
      dateCreate: [
        {
          value: moment(this.detail.dateCreate).format('DD MMM yyyy'),
          disabled: true,
        },
      ],
      userCreate: [{ value: this.detail.userCreate, disabled: true }],
      userUpdate: [{ value: this.detail.userUpdate, disabled: true }],
      dateUpdate: [
        {
          value: moment(this.detail.dateUpdate).format('DD MMM yyyy'),
          disabled: true,
        },
      ],
    });
    this.myForm.disable();
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_LOCATION);
    this.router.navigate(['/master/master-location']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-location/edit']);
  }
}
