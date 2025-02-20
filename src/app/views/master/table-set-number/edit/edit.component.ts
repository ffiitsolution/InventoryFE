import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SET_NUMBER } from 'src/constants';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class TableSetNumberEditComponent implements OnInit {
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
    this.detail = JSON.parse(
      this.g.getLocalstorage(LS_INV_SELECTED_SET_NUMBER)
    );
    this.myForm = this.form.group({
      key: [
        { value: this.detail.keyTransaksi, disabled: true },
        Validators.required,
      ],
      code: [
        { value: this.detail.kodeTransaksi, disabled: true },
        Validators.required,
      ],
      desc: [this.detail.keterangan, Validators.required],
    });
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.editing = true;
      const param = {
        keyTransaksi: controls?.['key']?.value?.toString(),
        kodeTransaksi: controls?.['code']?.value,
        keterangan: controls?.['desc']?.value,
        statusSync: 'T',
      };
      this.service.insert('/api/set-num/update', param).subscribe({
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
      type == 'alphanumeric'
        ? /^[a-zA-Z0-9 -]+$/
        : type == 'alphabet'
        ? /^[a-zA-Z -]+$/
        : type == 'city'
        ? /^[a-zA-Z0-9 -.]$/
        : type == 'setNum'
        ? /^[a-zA-Z0-9 .()\-/]$/
        : type == 'numeric'
        ? /^[0-9]$/
        : type == 'phone'
        ? /^[0-9-]$/
        : type == 'email'
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'excludedSensitive'
        ? /^[a-zA-Z0-9 .,_@-]*$/
        : type == 'kodeSingkat'
        ? /^[a-zA-Z]+$/
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
    localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
    this.router.navigate(['/master/master-set-number']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }
}
