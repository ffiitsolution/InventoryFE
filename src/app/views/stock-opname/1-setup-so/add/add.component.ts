import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../../service/app.service';
import { GlobalService } from '../../../../service/global.service';
import {
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_SET_NUMBER,
} from '../../../../../constants';
import { DataService } from '../../../../service/data.service';
import * as moment from 'moment';

@Component({
  selector: 'app-add-so',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class StockSoAddComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  userData: any;
  listTahun: any[] = [];
  listBulan: any[] = [];

  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };

  configSelectTahun: any;
  configSelectBulan: any;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    public g: GlobalService,
    private service: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userData = this.service.getUserData();
    this.myForm = this.form.group({
      tahun: ['', [Validators.required]],
      bulan: ['', [Validators.required]],
      keterangan: ['', [Validators.required]],
      noSo: new FormControl({value: '', disabled: true}),
      tanggalSo: new FormControl({value: '', disabled: true}),
      userCreate: [''],
      userUpdate: [''],
      dateCreate: [''],
      dateupdate: [''],
    });
    const year = parseInt(moment().format('YYYY'));
    let month = parseInt(moment().format('M'));
    this.myForm.controls['tahun'].setValue(year);
    this.myForm.controls['bulan'].setValue(month);

    month = month - 1;
    const lastDateOfMonth = moment({year, month}).endOf('month').format('DDMMYY');
    this.myForm.controls['tanggalSo'].setValue( moment({year, month}).endOf('month').format('DD MMM YYYY'));
    this.myForm.controls['noSo'].setValue(
      'SOP' + this.userData.defaultLocation.kodeLocation + '-' + lastDateOfMonth
    );

    this.listTahun = this.g.generateNumberRange(2025, 2125);
    this.listBulan = this.g.generateNumberRange(1, 12);

    this.configSelectTahun = {
      ...this.baseConfig,
      placeholder: 'Pilih Tahun',
      searchPlaceholder: 'Cari Tahun',
      limitTo: this.listTahun.length,
    };

    this.configSelectBulan = {
      ...this.baseConfig,
      placeholder: 'Pilih Bulan',
      searchPlaceholder: 'Cari Bulan',
      limitTo: this.listBulan.length,
    };

    // this.dataService
    //   .postData(this.g.urlServer + '/api/branch/dropdown-group', {})
    //   .subscribe((resp: any) => {
    //     this.kodeGroupOptions = resp.map((item: any) => ({
    //       value: item.KODE_GROUP,
    //       label: item.DESKRIPSI_GROUP,
    //     }));
    //   });
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
        } else
          this.toastr.error(
            'Beberapa kolom mengandung karakter khusus yang tidak diperbolehkan.'
          );
      }
    } else {
      this.adding = true;
      const param = {
        tahun: controls?.['tahun']?.value,
        bulan: controls?.['bulan']?.value,
        nomorSo: controls?.['noSo']?.value,
        tanggalSo: controls?.['tanggalSo']?.value,
        keterangan: controls?.['keterangan']?.value,
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        userCreate: this.userData.kodeUser,
      };
      this.service.insert('/api/stock-opname/insert', param).subscribe({
        next: (res) => {
          if (!res.success) {
            this.service.handleErrorResponse(res);
          } else {
            this.toastr.success('Berhasil!');
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.adding = false;
        },
        error: (err) => {
          this.adding = false;
        }
      });
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
    this.router.navigate(['/stock-opname/setup-so']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

  onChangeSelect(data: any, field: string) {
    const dataStatus = data?.target?.value;

    const year = this.myForm.controls['tahun']?.value ?? 2025;
    const month = (this.myForm.controls['bulan']?.value ?? 1) - 1;

    this.myForm.controls['tanggalSo'].setValue( moment({year, month}).endOf('month').format('DD MMM YYYY'));
    const lastDateOfMonth = moment({ year, month })
      .endOf('month')
      .format('DDMMYY');

    this.myForm.controls['noSo'].setValue(
      'SOP' + this.userData.defaultLocation.kodeLocation + '-' + lastDateOfMonth
    );
  }

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric' //kode cabang
        ? /^[a-zA-Z0-9]$/
        : type == 'namaCabang' //nama cabang
        ? /^[a-zA-Z0-9-().& \-]*$/
        : type == 'kodeSingkat' //kode singkat
        ? /^[A-Z0-9&-]$/
        : type == 'numeric' //kode pos
        ? /^[0-9]$/
        : type == 'phone' //phone 1 & 2, Fax 1 & 2
        ? /^[0-9-()\s]$/
        : type == 'email' //email
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'contactPerson' //contactPerson
        ? /^[a-zA-Z.\s]$/
        : type == 'alphabet' //tipe cabang
        ? /^[a-zA-Z]+$/
        : type == 'excludedSensitive' //keterangan & alamat 1-2
        ? /^[a-zA-Z0-9\s.,#\-()\/]+$/
        : /^[a-zA-Z.() ,\-]*$/; //alphabet

    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }
}
