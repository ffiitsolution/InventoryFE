import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SET_NUMBER,  LS_INV_SELECTED_BRANCH} from 'src/constants';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterBranchEditComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  showPassword: boolean = false;
  listKota: any[] = [];
  listRSC: any[] = [];
  listRegion: any[] = [];
  listArea: any[] = [];
  isEmailValid: boolean = true
  kodeGroupOptions: any;

  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name' // Key to search
  };

  configSelectKota: any;
  configSelectRSC: any;
  configSelectRegion: any;
  configSelectArea: any;
  detail: any;


  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(
      this.g.getLocalstorage(LS_INV_SELECTED_BRANCH)
    );
    console.log("this.detail", this.detail);

    this.myForm = this.form.group({
      namaCabang: [this.detail.namaCabang],
      kodeCabang: [this.detail.kodeCabang],
      kodeSingkat: [this.detail.kodeSingkat],
      kodeGroup: [this.detail.kodeGroup],
      deskripsiGroup: [this.detail.deskripsiGroup],
      kota: [this.detail.kota],
      alamat1: [this.detail.alamat1],
      alamat2: [this.detail.alamat2],
      kodePos: [this.detail.kodePos],
      telpon1: [this.detail.telpon1],
      telpon2: [this.detail.telpon2],
      fax1: [this.detail.fax1],
      fax2: [this.detail.fax2],
      alamatEmail: [this.detail.alamatEmail],
      keteranganRsc: [this.detail.keteranganRsc],
      kodeRegion: [this.detail.kodeRegion],
      keteranganRegion : [this.detail.keteranganRegion],  
      kodeArea: [this.detail.kodeArea],
      keteranganArea: [this.detail.keteranganArea],
      contactPerson: [this.detail.contactPerson],
      contactPhone: [this.detail.contactPhone],
      keterangan: [this.detail.keterangan],
      alamatIp: [this.detail.alamatIp],
      tipeCabang: [this.detail.tipeCabang],

      userCreate: [this.detail.userCreate],
      userUpdate: [this.detail.userUpdate],
      dateCreate: [this.detail.dateCreate],
      dateupdate: [this.detail.dateUpdate], 
    });

    this.configSelectKota = {
      ...this.baseConfig,
      placeholder: 'Pilih Kota',
      searchPlaceholder: 'Cari Kota',
      limitTo: this.listKota.length
    };

    this.configSelectRSC = {
      ...this.baseConfig,
      placeholder: 'Pilih RSC',
      searchPlaceholder: 'Cari RSC',
      limitTo: this.listRSC.length
    };

    this.configSelectRegion = {
      ...this.baseConfig,
      placeholder: 'Pilih Region',
      searchPlaceholder: 'Cari Region',
      limitTo: this.listRegion.length
    };

    this.configSelectArea = {
      ...this.baseConfig,
      placeholder: 'Pilih Area',
      searchPlaceholder: 'Cari Area',
      limitTo: this.listArea.length
    };

    this.dataService
    .postData(this.g.urlServer + '/api/city/dropdown-city',{})
    .subscribe((resp: any) => {
      this.listKota = resp.map((item: any) => ({
        id: item.KODE_KOTA,
        name: item.KODE_KOTA+" - " + item.KETERANGAN_KOTA,
      }));     
      const getKota = this.listKota.find(
        (item: any) => item.id === this.detail.kota
      );      
      this.myForm.get('kota')?.setValue(getKota);
      // console.log('getKota', getKota);    
      // console.log('this.myForm.get(kota)', this.myForm.get('kota'));   
     });

    

    this.dataService
    .postData(this.g.urlServer + '/api/rsc/dropdown-rsc',{})
    .subscribe((resp: any) => {
      this.listRSC = resp.map((item: any) => ({
        id: item.KODE_RSC,
        name: item.KODE_RSC+" - " + item.KETERANGAN_RSC,
      }));     
      const getRSC = this.listRSC.find(
        (item: any) => item.id === this.detail.kodeRsc
      );      
      this.myForm.get('keteranganRsc')?.setValue(getRSC);
      // console.log('this.myForm.get(keteranganRsc)', this.myForm.get('keteranganRsc'));   
    });

    this.dataService
    .postData(this.g.urlServer + '/api/region/dropdown-region',{})
    .subscribe((resp: any) => {
      this.listRegion = resp.map((item: any) => ({
        id: item.KODE_REGION  ,
        name: item.KODE_REGION+" - " + item.KETERANGAN_REGION,
      }));     
      const getRegion = this.listRSC.find(
        (item: any) => item.id === this.detail.kodeRegion
      );      
      this.myForm.get('keteranganRegion')?.setValue(getRegion); 
    });

    this.dataService
    .postData(this.g.urlServer + '/api/area/dropdown-area',{})
    .subscribe((resp: any) => {
      this.listArea = resp.map((item: any) => ({
        id: item.KODE_AREA  ,
        name: item.KODE_AREA+" - " + item.KETERANGAN_AREA,
      }));     
      const getArea = this.listArea.find(
        (item: any) => item.id === this.detail.kodeArea
      );      
      this.myForm.get('keteranganArea')?.setValue(getArea); 
    });

    this.dataService
    .postData(this.g.urlServer + '/api/branch/dropdown-group',{})
    .subscribe((resp: any) => {
      this.kodeGroupOptions = resp.map((item: any) => ({
        value: item.KODE_GROUP,
        label: item.DESKRIPSI_GROUP,
      }));    
      // const getGroup = this.kodeGroupOptions.find(
      //   (item: any) => item.id === this.detail.kodeGroup
      // );      
      // this.myForm.get('kodeGroup')?.setValue(getGroup); 
      // console.log('kodeGroupOptions',this.kodeGroupOptions);  
    });
  }

  onSubmit(): void {
    console.log("myForm", this.myForm.value);
    const { controls, invalid } = this.myForm;
    console.log("invalid", invalid);
    if (invalid || !this.isEmailValid) {
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.adding = true;
      const param = {
        namaCabang:  controls?.['namaCabang']?.value,
        kodeCabang:  controls?.['kodeCabang']?.value,
        kodeSingkat:  controls?.['kodeSingkat']?.value,
        kota:  controls?.['kota']?.value?.id,
        alamat1:  controls?.['alamat1']?.value,
        alamat2:  controls?.['alamat2']?.value,
        kodePos:  controls?.['kodePos']?.value,
        telpon1:  controls?.['telpon1']?.value,
        telpon2:  controls?.['telpon2']?.value,
        fax1:  controls?.['fax1']?.value,
        fax2:  controls?.['fax2']?.value,
        alamatEmail: controls?.['alamatEmail']?.value,
        kodeRsc: controls?.['keteranganRsc']?.value?.id,
        kodeRegion: controls?.['keteranganRegion']?.value?.id,
        kodeArea: controls?.['keteranganArea']?.value?.id,
        contactPerson: controls?.['contactPerson']?.value,
        contactPhone:controls?.['contactPhone']?.value,
        tipeCabang: controls?.['tipeCabang']?.value,
        keterangan: controls?.['keterangan']?.value,
        kodeGroup: controls?.['kodeGroup']?.value,

      };
      this.service.insert('/api/branch/update', param).subscribe({
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
    this.router.navigate(['/master/master-branch']);
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
        ? /^[a-zA-Z0-9]$/
        : type == 'numeric'
        ? /^[0-9]$/
        : type == 'phone'
        ? /^[0-9-]$/
        : type =='email'
        ? /^[a-zA-Z0-9@._-]$/
        : /^[a-zA-Z.() ,\-]$/;
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

  onChangeEmail(event: any) {
    const email = this.myForm.value.alamatEmail;
  
    // Email validation regex
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    if (!emailPattern.test(email)) {
      this.isEmailValid = false
    } else {
      this.isEmailValid = true
    }
    if(email ==''){
      this.isEmailValid = true
    }
  }
  
}
