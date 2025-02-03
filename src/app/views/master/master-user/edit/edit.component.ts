import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_USER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterUserEditComponent implements OnInit {
  myForm: FormGroup;
  editing: boolean = false;
  detail: any;
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
  isNotMatchPassPos: boolean = false;
  listRole: any[] = [];



  constructor(
    private form: FormBuilder,
    private router: Router,
    private service: AppService,
    private g: GlobalService,
    private toastr: ToastrService,
    private translation: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(
      this.g.getLocalstorage(LS_INV_SELECTED_USER)
    );
    this.myForm = this.form.group({
      kodeUser: [
        { value: this.detail.kodeUser, disabled: true },
        Validators.required,
      ],
      namaUser: [
        this.detail.namaUser ,
        Validators.required,
      ],
      kodePassword: [
        this.detail.kodePassword ,
        Validators.required,
      ],
      
      konfirmasiKodePassword:  [this.detail.kodePassword , Validators.required],
      statusAktif: [
        this.detail.statusAktif 
      ],
      jabatan: [
        this.detail.jabatan 
      ],
      defaultLocation: [{}],
      roleID:[],
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
      const getDefaultLocation = this.listLokasi.find(
        (item: any) => item.id === this.detail.defaultLocation
      );      
      this.myForm.get('defaultLocation')?.setValue(getDefaultLocation);
      console.log('getDefaultLocation', getDefaultLocation);
    });

    this.dataService
    .postData(this.g.urlServer + '/api/role/dropdown-role',{})
    .subscribe((resp: any) => {
      this.listRole = resp.map((item: any) => ({
        id: item.ID,
        name: item.NAME,
      }));      
      const getRoleID = this.listRole.find(
        (item: any) => Number(item.id) === Number(this.detail.roleId)
      );
      this.myForm.get('roleID')?.setValue(getRoleID);
    });

  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid || this.isNotMatchPass) {
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.editing = true;
      const param = {
        kodeUser:  controls?.['kodeUser']?.value,
        kodePassword:  controls?.['kodePassword']?.value,
        namaUser: controls?.['namaUser']?.value,
        statusAktif: controls?.['statusAktif']?.value,
        jabatan: controls?.['jabatan']?.value,
        defaultLocation: controls?.['defaultLocation']?.value?.id,
        roleID: controls?.['roleID']?.value?.id
      };
      this.service.patch('/api/users/current', param).subscribe({
        next: (res: any) => {
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
        error: (err: any) => {
          console.error('Error updating user:', err);
          alert('An error occurred while updating the user.');
          this.editing = false;
        },
      });         
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_USER);
    this.router.navigate(['/master/master-user']);
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

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }
}
