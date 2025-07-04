import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../../../service/app.service';
import { GlobalService } from '../../../../../service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_KENDARAAN } from '../../../../../../constants';

@Component({
  selector: 'app-master-kendaraan-add',
  templateUrl: './master-kendaraan-add.component.html',
  styleUrl: './master-kendaraan-add.component.scss'
})
export class MasterKendaraanAddComponent implements OnInit {
  myForm: FormGroup;
  defaultValue = 0;
  adding: boolean = false;
  sequence:any;
  submitted:boolean = false;
  showErrorToast:boolean = false;
  userData: any;
    baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };
  configSelectJenisKendaraan: any;

  listJenisKendaraan : any[] = [
 {
      id: 1,
      name: 'DRY',
    },
    {
      id: 2,
      name: 'RFR',
    },

  ];

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService
  ) {


    
  }

  ngOnInit(): void {
       this.configSelectJenisKendaraan = {
      ...this.baseConfig,
      placeholder: 'Pilih Jenis Kendaraan',
      limitTo: this.listJenisKendaraan.length,
    };
    this.userData = this.service.getUserData();
    this.myForm = this.form.group({
    noPolisi: [''],  // **only digits**]],
    namaKendaraan: ['', [Validators.required, Validators.maxLength(100),    Validators.pattern('^[a-zA-Z0-9 ]+$')]],  // **letters, numbers, spaces** ]],
    jenisKendaraan: ['', [Validators.required, Validators.maxLength(20),    Validators.pattern('^[a-zA-Z0-9 ]+$')]],  // **letters, numbers, spaces** ]],
    panjangKendaraan: [this.defaultValue.toFixed(2)],
    lebarKendaraan: [this.defaultValue.toFixed(2)],
    tinggiKendaraan: [this.defaultValue.toFixed(2)],
    tonaseKendaraan: ['', [Validators.required, Validators.maxLength(100),    Validators.pattern('^[a-zA-Z0-9 ]+$')]],  // **letters, numbers, spaces** ]],
    volumeKendaraan: [{ value: '' }],  // 🚩 computed field
    catatan1: [''], 
    toleransi: [this.defaultValue.toFixed(2)],
  });


  
  const panjang$ = this.myForm.get('panjangKendaraan')!.valueChanges;
  const lebar$  = this.myForm.get('lebarKendaraan')!.valueChanges;
  const tinggi$ = this.myForm.get('tinggiKendaraan')!.valueChanges;

  // When any changes, recalculate volume
  import('rxjs').then(rx => {
    rx.combineLatest([panjang$.pipe(rx.startWith(this.myForm.get('panjangKendaraan')!.value)),
                      lebar$.pipe(rx.startWith(this.myForm.get('lebarKendaraan')!.value)),
                      tinggi$.pipe(rx.startWith(this.myForm.get('tinggiKendaraan')!.value))])
      .subscribe(([p, l, t]: any) => {
      const P = parseFloat(p) || 0;
      const L = parseFloat(l) || 0;
      const T = parseFloat(t) || 0;
      const vol = (P * L * T).toFixed(2);
        this.myForm.get('volumeKendaraan')!.setValue(vol);
      });
  });
   


  }

   


  onSubmit(): void {
    this.submitted = true;
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.showErrorToast = true;
      this.g.markAllAsTouched(this.myForm);
      if (invalid) {
        if (
          Object.values(controls).some((control) =>
            control.hasError('required')
          )
        ) {
          this.toastr.error('Beberapa kolom wajib diisi.');
        }
         // Check for invalid pattern or maxLength errors on specific fields
    else if (controls['noRute'].invalid || controls['namaRute'].invalid) {
      // Check number-only violation
      if (controls['noRute'].hasError('pattern')) {
        this.toastr.error('Nomor Rute hanya boleh berisi angka (maks 10 karakter).');
      }
      // Check alphanumeric/name violation
      else if (controls['namaRute'].hasError('pattern')) {
        this.toastr.error('Nama Rute hanya boleh mengandung huruf, angka, dan spasi.');
      }
      // Generic invalid message
      else {
        this.toastr.error('Terdapat kesalahan pada input.');
      }

    }
    return;
  }
}  
      
     else {
      this.adding = true;
      const param = {
        noPolisi: controls?.['noPolisi']?.value,
        namaKendaraan: controls?.['namaKendaraan']?.value,
        panjang: controls?.['panjangKendaraan']?.value,
        lebar: controls?.['lebarKendaraan']?.value,
        tinggi: controls?.['tinggiKendaraan']?.value,
        volume: controls?.['volumeKendaraan']?.value,
        tonase: controls?.['tonaseKendaraan']?.value,
        toleransi: controls?.['toleransi']?.value,
        jenisKendaraan: controls?.['jenisKendaraan']?.value,
        catatan1: controls?.['catatan1']?.value,
        userCreate: this.userData.kodeUser,
       
      };
      this.service.insert('/api/kendaraan/insert', param).subscribe({
        next: (res) => {
          console.log(JSON.stringify(res), 'JSON Response');
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
      });
    }
  }

  // updated by Raymond 2 Juli 2025
 conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric'
        ? /^[a-zA-Z0-9]$/
        : type == 'noPolisi' 
        ? /^[0-9-]$/
        : type == 'numericdanalphabet'
        ? /^[a-zA-Z0-9-+().,&/ '\-]*$/
        : type == 'numeric'
        ? /^[0-9.]$/
        : type == 'phone'
        ? /^[0-9-]$/
        : type == 'email'
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'excludedSensitive'
        ? /^[a-zA-Z0-9&\s.,#\-()\/]+$/
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
    localStorage.removeItem(LS_INV_SELECTED_KENDARAAN);
    this.router.navigate(['/master/master-rute']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

    onChangeSelect(data: any, field: string) {
    const dataStatus = data?.target?.value;
    this.myForm.get('status')?.setValue(dataStatus);
  }
}

function decimal12_2Validator(): any {
  throw new Error('Function not implemented.');
}

