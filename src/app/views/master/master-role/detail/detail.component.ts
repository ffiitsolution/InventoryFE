import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_ROLE, LS_INV_SELECTED_UOM } from 'src/constants';

@Component({
  selector: 'app-detail-role',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class MasterRoleDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_ROLE));
    this.myForm = this.form.group({
      code: [this.detail.id],
      desc: [this.detail.name],
      dateCreate: [{ value: this.detail.dateCreate, disabled: true }],
      userCreate: [{ value: this.detail.userCreateName, disabled: true }],
      userUpdate: [{ value: this.detail.userUpdateName, disabled: true }],
      dateUpdate: [{ value: this.detail.dateUpdate, disabled: true }],
    });
    this.myForm.disable();
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_ROLE);
    this.router.navigate(['/master/master-role']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-role/edit']);
  }
}
