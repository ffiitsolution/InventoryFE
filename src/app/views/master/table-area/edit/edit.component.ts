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
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_AREA } from 'src/constants';

function code(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^A-Z0-9]+$/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { code: true };
  }
  return null;
}

function desc(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^A-Z0-9()-\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { desc: true };
  }
  return null;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class TableAreaEditComponent implements OnInit {
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
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_AREA));
    this.myForm = this.form.group({
      code: [
        { value: this.detail.kodeArea, disabled: true },
        [Validators.required, code],
      ],
      desc: [this.detail.keteranganArea, [Validators.required, desc]],
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
        user: this.g.getLocalstorage('inv_currentUser')?.kodeUser,
        statusSync: 'T',
      };
      this.service.insert('/api/area/update', param).subscribe({
        next: (res) => {
          if (!res.success) {
            this.service.handleErrorResponse(res);
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
      type == 'code' // code
        ? /^[a-zA-Z0-9]$/
        : type == 'desc' //desc
        ? /^[a-zA-Z0-9()-\s]$/
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
    localStorage.removeItem(LS_INV_SELECTED_AREA);
    this.router.navigate(['/master/master-area']);
  }
}
