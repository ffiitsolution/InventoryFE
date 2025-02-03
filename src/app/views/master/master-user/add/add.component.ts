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
  listLokasi: any[] = [];
  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name' // Key to search
  };
  configSelectLokasi: any ;
  configSelectRole: any ;
  isNotMatchPass: boolean = false;
  listRole: any[] = [];


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
      konfirmasiKodePassword:  ['', Validators.required],
      statusAktif:  ['A', Validators.required],
      defaultLocation:  [null],
      jabatan:  [''],
      roleID:[''],
    });

    this.configSelectLokasi = {
      ...this.baseConfig,
      placeholder: 'Pilih Lokasi',
      searchPlaceholder: 'Cari Lokasi',
      limitTo: this.listLokasi.length
    };
    this.configSelectRole = {
      ...this.baseConfig,
      placeholder: 'Pilih Role',
      searchPlaceholder: 'Cari Role',
      limitTo: this.listRole.length
    };
    this.dataService
    .postData(this.g.urlServer + '/api/location/dropdown-lokasi',{})
    .subscribe((resp: any) => {
      this.listLokasi = resp.map((item: any) => ({
        id: item.KODE_LOCATION,
        name: item.KETERANGAN_LOKASI,
      }));      
    });

    this.dataService
    .postData(this.g.urlServer + '/api/role/dropdown-role',{})
    .subscribe((resp: any) => {
      this.listRole = resp.map((item: any) => ({
        id: item.ID,
        name: item.NAME,
      }));      
    });
  }

  onSubmit(): void {
    // this.myForm.kodeUser.value
    const { controls, invalid } = this.myForm;
    if (invalid || this.isNotMatchPass) {
      console.log("inside invalid")
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.adding = true;
      const param = {
        kodeUser:  controls?.['kodeUser']?.value,
        kodePassword:  controls?.['kodePassword']?.value,
        namaUser: controls?.['namaUser']?.value,
        statusAktif: controls?.['statusAktif']?.value,
        jabatan: controls?.['jabatan']?.value,
        defaultLocation: controls?.['defaultLocation']?.value?.id,
        roleID: controls?.['roleID']?.value?.id

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
    this.myForm.get('statusAktif')?.setValue(dataStatus);
  }

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric'
        ? /[a-zA-Z0-9]/
        : type == 'numeric'
        ? /[0-9]/
        : /[a-zA-Z.() ,\-]/;
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

  onChangePassword(data: any, type: string) {
    if(type === 'user') {
      if((this.myForm.value.kodePassword!='' && this.myForm.value.konfirmasiKodePassword!='') && (this.myForm.value.kodePassword != this.myForm.value.konfirmasiKodePassword)) {  
        this.isNotMatchPass = true
      }
      else {
        this.isNotMatchPass = false
      }
    }

  }
  

}
