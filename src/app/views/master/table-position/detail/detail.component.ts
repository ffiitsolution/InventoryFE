import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_POSITION } from 'src/constants';

@Component({
  selector: 'app-detail-position',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class TablePositionDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_POSITION));
    this.myForm = this.form.group({
      code: [this.detail.code],
      desc: [this.detail.description],
      status: [this.detail.status],
      userUpd: [this.detail.userUpdateName],
      dateUpd: [this.detail.dateUpd],
    });
    this.myForm.disable();
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_POSITION);
    this.router.navigate(['/master/master-position']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-position/edit']);
  }
}
