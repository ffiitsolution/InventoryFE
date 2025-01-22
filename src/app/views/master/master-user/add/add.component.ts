import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SET_NUMBER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class MasterUserAddComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  showPassword: boolean = false;
  listLokasi: any[] = [
    { id: 1, name: 'Jakarta' },
    { id: 2, name: 'Bandung' },
    { id: 3, name: 'Surabaya' },
    { id: 4, name: 'Medan' },
    { id: 5, name: 'Yogyakarta' }

  ];
  configSelectLokasi: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    placeholder: 'Pilih Lokasi', // Placeholder text
    customComparator: () => {}, // Custom sorting comparator
    limitTo: this.listLokasi.length, // Limit the number of displayed options
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchPlaceholder: 'Cari Lokasi', // Placeholder for the search input
    searchOnKey: 'name' // Key to search
  };
  

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.myForm = this.form.group({
      kodeUser:  ['', Validators.required],
      namaUser:  ['', Validators.required],
      kodePassword:  ['', Validators.required],
      statusAktif:  ['A', Validators.required],
      defaultLocation:  [null],
      jabatan:  [''],
    });
    this.dataService
    .postData(this.g.urlServer + '/api/location/dropdown-lokasi',{})
    .subscribe((resp: any) => {
      this.listLokasi = resp.map((item: any) => ({
        id: item.KODE_LOCATION,
        name: item.KETERANGAN_LOKASI,
      }));      
    });
  }

  onSubmit(): void {
    // this.myForm.kodeUser.value
    console.log('this.myForm', this.myForm.controls);
    console.log('myform2',this.myForm.get('kodeUser')?.value); // Logs the current value of 'desc'
      console.log('myform2',this.myForm.controls?.["defaultLocation"]?.value?.id); // Logs the current value of 'desc'

    const { controls, invalid } = this.myForm;
    if (invalid) {
      console.log('invalid', invalid);
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.adding = true;
      const param = {
        kodeUser:  controls?.['kodeUser']?.value,
        kodePassword:  controls?.['kodePassword']?.value,
        namaUser: controls?.['namaUser']?.value,
        statusAktif: controls?.['statusAktif']?.value,
        jabatan: controls?.['jabatan']?.value,
        defaultLocation: controls?.['defaultLocation']?.value?.id
      };
      this.service.insert('/api/users', param).subscribe({
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
    this.router.navigate(['/master/master-user']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onChangeSelect(data: any, field: string) {
    const dataStatus = data?.target?.value;
    console.log('field', field, 'data', data, 'dataStatus', dataStatus);
    this.myForm.get('statusAktif')?.setValue(dataStatus);
  }

}
