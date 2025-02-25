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
export class TableSetNumberDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(
      this.g.getLocalstorage(LS_INV_SELECTED_SET_NUMBER)
    );
    this.myForm = this.form.group({
      key: [this.detail.keyTransaksi],
      code: [this.detail.kodeTransaksi],
      desc: [this.detail.keterangan],
    });
    this.myForm.disable();
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
    this.router.navigate(['/master/master-set-number']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-set-number/edit']);
  }
}
