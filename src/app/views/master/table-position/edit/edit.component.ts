import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { values } from 'lodash-es';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_POSITION } from 'src/constants';

function code(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^0-9]+$/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { code: true };
  }
  return null;
}

function desc(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9-\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { desc: true };
  }
  return null;
}
@Component({
  selector: 'app-edit-position',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class TablePositionEditComponent implements OnInit {
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
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_POSITION));
    console.log(this.detail.cond);
    this.myForm = this.form.group({
      cond: [{ value: this.detail.cond, disabled: true }],
      code: [
        { value: this.detail.code, disabled: true },
        [Validators.required, code],
      ],
      desc: [this.detail.description, [Validators.required, desc]],
      status: [this.detail.status, [Validators.required]],
      userUpd: [{ value: this.detail.userUpd, disabled: true }],
      dateUpd: [{ value: this.detail.dateUpd, disabled: true }],
    });
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
      if (invalid) {
        if (
          Object.values(controls).some((control) =>
            control.hasError('required')
          )
        ) {
          this.toastr.error('Beberapa kolom wajib diisi.');
        } else if (
          Object.values(controls).some((control) => control.hasError('code')) ||
          Object.values(controls).some((control) => control.hasError('area'))
        ) {
          this.toastr.error(
            'Beberapa kolom mengandung karakter khusus yang tidak diperbolehkan.'
          );
        }
      }
    } else {
      this.editing = true;
      const param = {
        code: controls?.['code']?.value,
        desc: controls?.['desc']?.value,
        status: controls?.['status']?.value,
        cond: controls?.['cond']?.value,
        user: this.g.getLocalstorage('inv_currentUser')?.kodeUser,
      };
      this.service.insert('/api/position/update', param).subscribe({
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

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'code'
        ? /^[0-9]+$/
        : type == 'desc' //desc
        ? /^[a-zA-Z0-9-\s]$/
        : /^[a-zA-Z.() ,\-]*$/;
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

  convertToUppercase(id: any) {
    const control = this.myForm.get(id);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_POSITION);
    this.router.navigate(['/master/master-position']);
  }
}
