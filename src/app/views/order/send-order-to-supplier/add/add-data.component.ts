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
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],

})
export class AddDataSendOrderToSupplierComponent implements OnInit {
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
  listRole: any[] = [];
  
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfigTglKirimBarang: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfigTglBatalPesanan: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  bsConfig: Partial<BsDatepickerConfig>;
  listRSC: any[] = [];
  configSelectRSC: any ;
  gudangDetail: any[] = [];
  currentUser : any;
  isShowDetail = false;
  newNomorPesanan :any;
  isShowModalBack: boolean = false;
  isShowModalBuatPesanan: boolean = false;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.g.getLocalstorage('inv_currentUser');
    this.myForm = this.form.group({

      statusAktif:  ['A', Validators.required],
      tanggalPesanan: [{ value: new Date(new Date().setDate(new Date().getDate())), disabled: true }, Validators.required],
      tanggalKirimBarang: [ new Date(new Date().setDate(new Date().getDate()  + 3)), Validators.required], // Default: Today
      tanggalBatalPesanan: [{ value: new Date(new Date().setDate(new Date().getDate()  + 7)), disabled: false }, Validators.required],
      RSCTujuan: ['', Validators.required],
      namaGudang:  [{value: '', disabled: true}],
      alamatGudang:  [{value: '', disabled: true}],
      statusGudang:  [{value: '', disabled: true}],
      kodeSingkat:  [{value: '', disabled: true}],
      catatan1: [''],
      catatan2: [''],
      newNomorPesanan: [{value: '', disabled: true}]
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
    this.configSelectRSC = {
      ...this.baseConfig,
      placeholder: 'Pilih RSC',
      searchPlaceholder: 'Cari RSC',
      limitTo: this.listRSC.length
    };

    this.dataService
    .postData(this.g.urlServer + '/api/rsc/dropdown-rsc',{})
    .subscribe((resp: any) => {
      this.listRSC = resp.map((item: any) => ({
        id: item.KODE_RSC,
        name: item.KODE_RSC+' - '+item.KETERANGAN_RSC,
      }));     
    });

    this.dataService
    .postData(this.g.urlServer + '/api/send-order-to-supplier/get-nopesanan',
      {"kodeGudang":  this.currentUser?.defaultLocation?.kodeLocation}
    )
    .subscribe((resp: any) => {
      this.newNomorPesanan = resp;
      this.myForm.get('newNomorPesanan')?.setValue(this.newNomorPesanan.newNomorPesanan);
      console.log("this.newNomorPesanan",this.newNomorPesanan.newNomorPesanan);
    });

    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;

    this.dpConfigTglKirimBarang.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigTglKirimBarang.adaptivePosition = true;
    this.dpConfigTglKirimBarang.minDate = new Date(new Date().setHours(0, 0, 0, 0));

    this.dpConfigTglBatalPesanan.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigTglBatalPesanan.adaptivePosition = true;
    this.dpConfigTglBatalPesanan.minDate = new Date(new Date().setHours(0, 0, 0, 0));
    
    this.g.removeLocalstorage('TEMP_ORDHDK');
  }

  

  onSubmit(): void {
    this.isShowModalBuatPesanan = false;
    const currentUser = this.g.getLocalstorage('inv_currentUser');
    
    const { controls, invalid } = this.myForm;


    if (invalid || (this.compareDates(this.myForm.value.tanggalKirimBarang, this.myForm.value.tanggalBatalPesanan)) || (currentUser?.defaultLocation?.kodeLocation === this.myForm.value?.gudangTujuan?.id) ||(this.compareDates(this.  myForm?.controls?.['tanggalPesanan']?.value, this.myForm.value.tanggalKirimBarang)) ) {
      this.g.markAllAsTouched(this.myForm);
      this.toastr.error("Form tidak valid");

    } else {
      this.adding = true;
      const param = {
        kodeGudang:   currentUser?.defaultLocation?.kodeLocation,
        kodeSingkat:   controls?.['kodeSingkat']?.value,
        supplier:  controls?.['RSCTujuan']?.value?.id,
        namaSupplier:  controls?.['RSCTujuan']?.value?.name,
        tanggalPesanan:  moment(  controls?.['tanggalPesanan']?.value).format("DD-MM-YYYY"),
        tanggalKirimBarang:  moment(  controls?.['tanggalKirimBarang']?.value).format("DD-MM-YYYY"),
        tanggalBatalEXP: moment(  controls?.['tanggalBatalPesanan']?.value).format("DD-MM-YYYY"),
        keteranganSatu: controls?.['catatan1']?.value,
        keteranganDua: controls?.['catatan2']?.value,

      };

      this.g.saveLocalstorage('TEMP_ORDHDK', param);

      setTimeout(() => {
        this.isShowDetail = true;
        this.myForm.get('catatan1')?.disable();
        this.myForm.get('catatan2')?.disable();
        this.myForm.get('RSCTujuan')?.disable();
        this.myForm.get('tanggalKirimBarang')?.disable();
        this.myForm.get('tanggalBatalPesanan')?.disable();
        
          // this.onNextPressed();
        }, DEFAULT_DELAY_TIME);
      }
      this.adding = false;

    }
   
    onNextPressed() {
      this.router.navigate(['/order/send-order-to-supplier/add-data-detail']);
    }
  
    onPreviousPressed() {
      localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
      this.router.navigate(['/order/send-order-to-supplier/']);
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



  onRSCTujuanChange(selectedValue: any) {
    console.log("this RSCTujuan",this.myForm.value.RSCTujuan)
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

  onDateChangeTglKirimBarang(event: Date): void {
    this.dpConfigTglBatalPesanan.minDate = event; //update the batal pesanan mindate to tanggal kirim barang
    console.log('Selected Date:', event);
  }

  compareDates(date1: any, date2: any): boolean {
    if (!date1 || !date2) return false; // Ensure both dates exist

    const d1 = new Date(date1).setHours(0, 0, 0, 0); // Remove time
    const d2 = new Date(date2).setHours(0, 0, 0, 0); // Remove time

    return d1 > d2; // Compare only the date part
  }

  onShowModalBack() {
    this.isShowModalBack= true;
  }

  onShowModalBuatPesanan() {
    this.isShowModalBuatPesanan= true;
  }

}
