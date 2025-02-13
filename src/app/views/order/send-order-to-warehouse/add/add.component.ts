import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SET_NUMBER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class SendOrderToWarehouseAddComponent implements OnInit {
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
  configSelectDefaultLokasi: any ;
  configSelectRole: any ;
  isNotMatchPass: boolean = false;
  listRole: any[] = [];
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  bsConfig: Partial<BsDatepickerConfig>;
  listGudang: any[] = [];
  configSelectGudang: any ;
  gudangDetail: any[] = [];


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

      statusAktif:  ['A', Validators.required],
      tanggalPesanan: [{ value: new Date(new Date().setDate(new Date().getDate() - 3)), disabled: true }, Validators.required],
      tanggalKirimBarang: [new Date(), Validators.required], // Default: Today
      tanggalBatalPesanan: [{ value: new Date(new Date().setDate(new Date().getDate()  + 4)), disabled: false }, Validators.required],
      gudangTujuan: ['', Validators.required],
      namaGudang:  [{value: '', disabled: true}],
      alamatGudang:  [{value: '', disabled: true}],
      statusGudang:  [{value: '', disabled: true}],
      kodeSingkat:  [{value: '', disabled: true}],
      catatan1: [''],
      catatan2: [''],
    });

    this.configSelectDefaultLokasi = {
      ...this.baseConfig,
      placeholder: 'Pilih Default Lokasi',
      searchPlaceholder: 'Cari Default Lokasi',
      limitTo: this.listLokasi.length
    };
    this.configSelectRole = {
      ...this.baseConfig,
      placeholder: 'Pilih Role',
      searchPlaceholder: 'Cari Role',
      limitTo: this.listRole.length
    };
    this.configSelectGudang = {
      ...this.baseConfig,
      placeholder: 'Pilih Gudang',
      searchPlaceholder: 'Cari Gudang',
      limitTo: this.listGudang.length
    };


    this.dataService
    .postData(this.g.urlServer + '/api/branch/dropdown-gudang',{})
    .subscribe((resp: any) => {
      this.listGudang = resp.map((item: any) => ({
        id: item.KODE_CABANG,
        name: item.KODE_CABANG+' - '+item.NAMA_CABANG,
      }));      
    });


    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
  }

  

  onSubmit(): void {
    const currentUser = this.g.getLocalstorage('inv_currentUser');

    const { controls, invalid } = this.myForm;


     if (invalid || this.isNotMatchPass) {
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.adding = true;
      const param = {
        kodeGudang:   currentUser?.defaultLocation?.kodeLocation,
        kodeSingkat:   controls?.['kodeSingkat']?.value,
        supplier:  controls?.['gudangTujuan']?.value?.id,
        namaSupplier:  controls?.['gudangTujuan']?.value?.name,
        tanggalPesanan:  moment(  controls?.['tanggalPesanan']?.value).format("DD-MM-YYYY"),
        tanggalKirimBarang:  moment(  controls?.['tanggalKirimBarang']?.value).format("DD-MM-YYYY"),
        tanggalBatalEXP: moment(  controls?.['tanggalPesanan']?.value).format("DD-MM-YYYY"),
        keteranganSatu: controls?.['catatan1']?.value,
        keteranganDua: controls?.['catatan2']?.value,

      };

      this.g.saveLocalstorage('TEMP_ORDHDK', param);

      setTimeout(() => {
          this.onNextPressed();
        }, DEFAULT_DELAY_TIME);
      }
      this.adding = false;

      // const param = {
      //     "kodeGudang": "00072",
      //     "supplier": "00052",
      //     "tipePesanan": "I",
      //     "nomorPesanan": "RO-000720009999",
      //     "tanggalPesanan": "07-02-2025",
      //     "tanggalKirimBarang": "10-02-2025",
      //     "tanggalBatalEXP": "14-02-2025",
      //     "keteranganSatu": "72 ke 52"           
      // }

      // this.service.insert('/api/users', param).subscribe({
      //   next: (res) => {
      //     if (!res.success) {
      //       alert(res.message);
      //     } else {
      //       this.toastr.success('Berhasil!');
      //       setTimeout(() => {
      //         this.onPreviousPressed();
      //       }, DEFAULT_DELAY_TIME);
      //     }
      //     this.adding = false;
      //   },
      // });
    }
   
    // if (invalid || this.isNotMatchPass) {
    //   console.log("inside invalid")
    //   this.g.markAllAsTouched(this.myForm);
    // } else {
    //   this.adding = true;
    //   const param = {
    //     kodeUser:  controls?.['kodeUser']?.value,
    //     kodePassword:  controls?.['kodePassword']?.value,
    //     namaUser: controls?.['namaUser']?.value,
    //     statusAktif: controls?.['statusAktif']?.value,
    //     jabatan: controls?.['jabatan']?.value,
    //     defaultLocation: controls?.['defaultLocation']?.value?.id ?? " ",
    //     roleID: controls?.['roleID']?.value?.id,
    //   };
    //   this.service.insert('/api/users', param).subscribe({
    //     next: (res) => {
    //       if (!res.success) {
    //         alert(res.message);
    //       } else {
    //         this.toastr.success('Berhasil!');
    //         setTimeout(() => {
    //           this.onPreviousPressed();
    //         }, DEFAULT_DELAY_TIME);
    //       }
    //       this.adding = false;
    //     },
    //   });
    // }
  // }

  onNextPressed() {
    this.router.navigate(['/order/send-order-to-warehouse/add-data-detail']);
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
    this.router.navigate(['/order/send-order-to-warehouse/']);
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
        : type == 'excludedSensitive'
        ?/^[a-zA-Z0-9 .,_@-]*$/
        : type =='kodeSingkat'
        ? /^[a-zA-Z]+$/
        :/^[a-zA-Z.() ,\-]*$/;
        
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

  onGudangTujuanChange(selectedValue: any) {
    this.getGudangDetail(selectedValue?.value?.id);
  }

  getGudangDetail(kodeGudang: any) {
  if (!kodeGudang || kodeGudang.trim() === '') {
    return; // Stop execution if kodeGudang is empty or invalid
  }

  this.dataService
    .postData(this.g.urlServer + '/api/branch/branch-detail', { "kodeCabang": kodeGudang })
    .subscribe((resp: any) => {
      this.gudangDetail = resp;

      this.myForm.get('namaGudang')?.setValue(this.gudangDetail?.length ? this.gudangDetail[0].NAMA_CABANG : null);
      this.myForm.get('alamatGudang')?.setValue(this.gudangDetail?.length ? this.gudangDetail[0].ALAMAT1 : null);
      this.myForm.get('statusGudang')?.setValue(
        this.gudangDetail?.length
          ? (this.gudangDetail[0].STATUS_AKTIF === "A" ? "Aktif" : "Tidak Aktif")
          : null
      );    
      this.myForm.get('kodeSingkat')?.setValue(this.gudangDetail?.length ? this.gudangDetail[0].KODE_SINGKAT : null);  
    }); 
}


}
