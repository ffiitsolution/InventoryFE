import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_RSC } from 'src/constants';

@Component({
  selector: 'app-edit-rsc',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class TableRscEditComponent implements OnInit {
  myForm: FormGroup;
  editing: boolean = false;
  detail: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private service: AppService,
    private g: GlobalService,
    private toastr: ToastrService,
    private translation: TranslateService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_RSC));
    this.myForm = this.form.group({
      code: [
        { value: this.detail.kodeRsc, disabled: true },
        Validators.required,
      ],
      desc: [this.detail.keteranganRsc, Validators.required],
      dateCreate: [{ value: this.detail.dateCreate, disabled: true }],
      userCreate: [{ value: this.detail.userCreate, disabled: true }],
      userUpdate: [{ value: this.detail.userUpdate, disabled: true }],
      dateUpdate: [{ value: this.detail.dateUpdate, disabled: true }],
    });
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.editing = true;
      const param = {
        code: controls?.['code']?.value,
        desc: controls?.['desc']?.value,
        user: this.g.getLocalstorage('inv_currentUser')?.kodeUser,
        statusSync: 'T',
      };
      this.service.insert('/api/rsc/update', param).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.toastr.success(this.translation.instant('Berhasil!'));
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.editing = false;
        },
      });
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_RSC);
    this.router.navigate(['/master/master-rsc']);
  }
}
