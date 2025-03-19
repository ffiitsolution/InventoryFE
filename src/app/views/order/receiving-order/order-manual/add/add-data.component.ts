import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SET_NUMBER, ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER  } from 'src/constants';

import { DataService } from 'src/app/service/data.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import { TranslationService } from '../../../../../service/translation.service';
import { Page } from '../../../../../model/page';

function excludedSensitive(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9\s.,#\-()\/]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { excludedSensitive: true };
  }
  return null;
}
@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],

})
export class AddDataOrderManualComponent implements OnInit {
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
  listGudang: any[] = [];
  configSelectGudang: any ;
  gudangDetail: any[] = [];
  currentUser : any;
  isShowDetail = false;
  newNomorPesanan :any;
  isShowModalBack: boolean = false;
  isShowModalBranch: boolean = false;
  isShowModalBuatPesanan: boolean = false;

  dtOptionsPemesan: DataTables.Settings = {};
  selectedRowData: any;
  page = new Page();

  selectedRow: any = {};

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private dataService: DataService,
    private translationService: TranslationService,
    private globalService: GlobalService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.g.getLocalstorage('inv_currentUser');
    this.myForm = this.form.group({

      statusAktif:  ['A', Validators.required],
      tanggalPesanan: [{ value: new Date(new Date().setDate(new Date().getDate())), disabled: true }, Validators.required],
      tanggalKirimBarang: [ new Date(new Date().setDate(new Date().getDate()  + 3)), Validators.required], // Default: Today
      tanggalBatalPesanan: [{ value: new Date(new Date().setDate(new Date().getDate()  + 7)), disabled: false }, Validators.required],
      gudangTujuan: ['', Validators.required],
      namaGudang:  [{value: '', disabled: true}],
      alamatGudang:  [{value: '', disabled: true}],
      statusGudang:  [{value: '', disabled: true}],
      kodeSingkat:  [{value: '', disabled: true}],
      catatan1: ['',[excludedSensitive]],
      catatan2: ['',[excludedSensitive]],
      newNomorPesanan: [{value: '', disabled: true}],
      tipeOrder:['']
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
      searchPlaceholder: 'Cari Gudag',
      limitTo: this.listGudang.length
    };


    this.dataService
    .postData(this.g.urlServer + '/api/send-order-to-warehouse/get-nopesanan',
      {"kodeGudang":  this.currentUser?.defaultLocation?.kodeLocation}
    )
    .subscribe((resp: any) => {
      this.newNomorPesanan = resp;
      this.myForm.get('newNomorPesanan')?.setValue(this.newNomorPesanan.newNomorPesanan);
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

    this.renderDataTables();

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
        kodePemesan:  controls?.['gudangTujuan']?.value,
        tglPesan: moment(controls?.['tanggalPesanan']?.value).format("DD MMM YYYY"),
        tglBrgDikirim:  moment(  controls?.['tanggalKirimBarang']?.value).format("DD MMM YYYY"),
        tglKadaluarsa: moment(  controls?.['tanggalBatalPesanan']?.value).format("DD MMM YYYY"),
        keterangan1: controls?.['catatan1']?.value,
        keterangan2: controls?.['catatan2']?.value,

      };

      this.g.saveLocalstorage('TEMP_ORDHDK', param);

      const tglkirimbrg =  moment(controls?.['tanggalKirimBarang']?.value).format("DD/MM/YYYY");
      this.myForm.controls['tanggalKirimBarang'].setValue("00/00/0000");
      this.myForm.controls['tanggalKirimBarang'].setValue(tglkirimbrg);
      const tglbatalpsnn =  moment(controls?.['tanggalBatalPesanan']?.value).format("DD/MM/YYYY");
      this.myForm.controls['tanggalBatalPesanan'].setValue("00/00/0000");
      this.myForm.controls['tanggalBatalPesanan'].setValue(tglbatalpsnn);
      

      setTimeout(() => {
        this.isShowDetail = true;
        this.myForm.get('catatan1')?.disable();
        this.myForm.get('catatan2')?.disable();
        this.myForm.get('RSCTujuan')?.disable();
        this.myForm.get('tanggalKirimBarang')?.disable();
        this.myForm.get('tanggalBatalPesanan')?.disable();
        this.myForm.get('gudangTujuan')?.disable();       
        this.myForm.get('tipeOrder')?.disable();        
 
          // this.onNextPressed();
        }, DEFAULT_DELAY_TIME);
      }
      this.adding = false;

    }
   
    // onNextPressed() {
    //   this.router.navigate(['/order/send-order-to-supplier-via-rsc/add-data-detail']);
    // }
  
    onPreviousPressed() {
      localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
      this.router.navigate(['/order/receiving-order']);
    }
  


  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onChangeSelect(data: any, field: string) {
    const tipeOrder = data?.target?.value;
    this.myForm.get('catatan1')?.setValue(tipeOrder);
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
        : type =='tanggal'
        ? /^[0-9\/]+$/
        : /^[a-zA-Z.() ,\-]*$/;        
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }




  onDateChangeTglKirimBarang(event: Date): void {
    this.dpConfigTglBatalPesanan.minDate = event; //update the batal pesanan mindate to tanggal kirim barang
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

  onShowModalBranch() {
    this.isShowModalBranch= true;
  }

  onShowModalBuatPesanan() {
    this.isShowModalBuatPesanan= true;
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


  handleEnter(event: any) {
  
  }

    renderDataTables(): void {
      this.dtOptionsPemesan = {
        language:
          this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
        processing: true,
        serverSide: true,
        autoWidth: true,
        info: true,
        drawCallback: (drawCallback) => {
          this.selectedRowData = undefined;
        },
        ajax: (dataTablesParameters: any, callback) => {
          this.page.start = dataTablesParameters.start;
          this.page.length = dataTablesParameters.length;
          const requestData = {
            ...dataTablesParameters,
          };
          this.dataService
            .postData(this.g.urlServer + '/api/branch/dt', requestData)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  kodeKeteranganRsc: `${rest.kodeRsc} - ${rest.keteranganRsc}`,
                  dtIndex: this.page.start + index + 1,
                };
                return finalData;
              });
              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: mappedData,
              });
            });
        },
        columns: [
          { data: 'dtIndex', title: '#', orderable: false, searchable: false },
          { data: 'kodeCabang', title: 'Kode', searchable: true },
          { data: 'namaCabang', title: 'Nama', searchable: true },
          { data: 'keteranganRsc', title: 'RSC', searchable: true },
          { data: 'kota', title: 'Kota', searchable: true },
          { data: 'deskripsiGroup', title: 'Group', searchable: true },
          {
            data: 'statusAktif',
            title: 'Status',
            searchable: false,
            render: (data) => {
              if (data === 'A') {
                return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
              }
              return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:grey; width: 60px">Inactive</span> </div>`;
            },
          },
          {
            title: 'Action',
            render: () => {
              return `
              <div class="btn-group" role="group" aria-label="Action">
                <button class="btn btn-sm action-select btn-outline-info btn-60">Pilih</button>
              </div>
            `;
            },
          },
        ],
        searchDelay: 1500,
        order: [
          [1, 'asc'],
        ],
  rowCallback: (row: Node, data: any[] | Object, index: number) => {
         $('.action-select', row).on('click', () =>
           this.actionBtnClick(ACTION_SELECT, data)
         );
         if (index === 0 && !this.selectedRowData) {
           setTimeout(() => {
             $(row).trigger('td'); 
           }, 0);
         }
         $('td', row).on('click', () => {
           $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
           if (this.selectedRowData !== data) {
             this.selectedRowData = data;
             $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
           } else {
             this.selectedRowData = undefined;
           }
         });
       
     
         return row;
 
       },
      };
    }

    actionBtnClick(action: string, data: any = null) {
      this.selectedRow = (data);
      console.log("this.selectedrow",this.selectedRow)
      this.isShowModalBranch = false;
      console.log("end actionbtnclick",this.isShowModalBranch)
      this.mappingDataPemesan()
    }
    mappingDataPemesan() {
      this.myForm.controls['gudangTujuan'].setValue(this.selectedRow.kodeCabang);
      this.myForm.controls['namaGudang'].setValue(this.selectedRow.namaCabang);
      this.myForm.controls['statusGudang'].setValue(this.selectedRow.statusAktif);
      this.myForm.controls['alamatGudang'].setValue(this.selectedRow.alamat1);      
    }
}
