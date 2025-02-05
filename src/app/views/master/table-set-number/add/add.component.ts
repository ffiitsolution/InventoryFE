import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SET_NUMBER } from 'src/constants';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class TableSetNumberAddComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService
  ) {}

  ngOnInit(): void {
    this.myForm = this.form.group({
      key: ['', Validators.required],
      code: ['', Validators.required],
      desc: ['', Validators.required],
    });
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.adding = true;
      const param = {
        keyTransaksi: controls?.['key']?.value,
        kodeTransaksi: controls?.['code']?.value,
        keterangan: controls?.['desc']?.value,
        statusSync: 'T',
      };
      this.service.insert('/api/set-num/insert', param).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.toastr.success('Berhasil!');
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.adding = false;
        },
      });
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
