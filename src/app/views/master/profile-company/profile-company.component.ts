import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_USER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'profile-company',
  templateUrl: './profile-company.component.html',
  styleUrl: './profile-company.component.scss',
})
export class ProfileCompanyComponent implements OnInit,OnDestroy {
  myForm: FormGroup;
  editing: boolean = false;
  detail: any;
  listLokasi: any[] = [];
  listDefaultLokasi: any[] = [];
  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };

  isSubmitting: boolean=false;
  configRsc: any;
  listRsc: any = [];
  selectedRsc: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  roleId: number;
  showPassword: boolean;
  loadingRsc: boolean=false;
  loadingTest: boolean=false;
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
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;
    this.configRsc = this.g.dropdownConfig('description');
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_USER));
    this.myForm = this.form.group({
      kodePerusahaan: [
        { value: '', disabled: true },
        Validators.required,
      ],
      namaPerusahaan1: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      namaPerusahaan2: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      alamat1: ['', Validators.required],
      alamat2: ['', Validators.required],
      namaKota: ['', Validators.required],
      kodePos: ['', Validators.required],
      negara: ['', Validators.required],
      noTelp1: [''],
      noTelp2: [''],
      noFax1: [''],
      noFax2: [''],
      alamatOrcl: ['',Validators.required],
      passwordOrcl:['',Validators.required],
      ipSvrhq:['',Validators.required],
      website:[''],
      alamatEmail:[''],
      batasKadaluarsaPo:['',[Validators.required,Validators.min(1)]],
      defaultTglKirimPo:['',[Validators.required,Validators.min(1)]],
      defaultRsc:['',Validators.required],
      lokasiDataBackup:['',Validators.required],
      statusConnection:['']
    });

    this.loadData();
    this.getListRsc();
  }

  onSubmit(): void {
   
    if(this.myForm.valid){
      this.isSubmitting =true;
      this.editing = true;
      const requestBody = { ...this.myForm.getRawValue() };
      requestBody.defaultRsc = this.myForm.get('defaultRsc')?.value?.code;

      this.service.patch('/api/profile/update', requestBody).subscribe({
        next: (res: any) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.toastr.success(this.translation.instant('Berhasil Update!'));
          }
          this.editing = false;
          this.isSubmitting =false;
        },
        error: (err: any) => {
          alert('An error occurred while updating the profile.');
          this.editing = false;
          this.isSubmitting =false;
        },
      });
    }
  }

  loadData(){
    this.service.getProfileCompany()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any) => {
         
            if (res) {
              this.myForm.patchValue({
                kodePerusahaan: res.kodePerusahaan || '',
                namaPerusahaan1: res.namaPerusahaan1 || '',
                namaPerusahaan2: res.namaPerusahaan2 || '',
                alamat1: res.alamat1 || '',
                alamat2: res.alamat2 || '',
                namaKota: res.namaKota || '',
                kodePos: res.kodePos || '',
                negara: res.negara || '',
                noTelp1: res.noTelp1 || '',
                noTelp2: res.noTelp2 || '',
                noFax1: res.noFax1 || '',
                noFax2: res.noFax2 || '',
                alamatOrcl: res.alamatOrcl || '',
                passwordOrcl: res.passwordOrcl || '',
                ipSvrhq: res.ipSvrhq || '',
                website: res.website || '',
                alamatEmail: res.alamatEmail || '',
                batasKadaluarsaPo: res.batasKadaluarsaPo || '',
                defaultTglKirimPo: res.defaultTglKirimPo || '',
                defaultRsc:{code:res.defaultRsc,name:res.name,description:res.description},
                lokasiDataBackup: res.lokasiDataBackup || '',
              });
            }
          
      },
    });
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_USER);
    this.router.navigate(['/master/master-user']);
  }

  getListRsc() {
    this.loadingRsc=true;
    this.service
      .insert('/api/report/list-report-param', { type: 'listRsc', report: '' })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          const data = res.data ?? [];
          this.listRsc =data;
          this.loadingRsc=false;
        },
        error: (error) => {
          this.loadingRsc=false;
          console.log(error);
        },
      });
  }
  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric'
        ? /[a-zA-Z0-9]/
        : type == 'jabatan'
        ? /[a-zA-Z-_\s.]/
        : type == 'numeric'
        ? /[0-9]/
        : /^[a-zA-Z.() ,\-]*$/;
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

 

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

  togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
  }

  onChangeLocation(selected: any) {
    const defaultLocationId = this.myForm.get('defaultLocation')?.value?.id;
    this.listDefaultLokasi = selected;
    if (
      selected.some(
        (item: { id: string; name: string }) => item.id === defaultLocationId
      ) == false
    ) {
      this.myForm.get('defaultLocation')?.setValue('');
    }
    // You can perform further actions here
  }

  onTestConnection(){
    this.loadingTest =true;
    const ip=this.myForm.get('ipSvrhq')?.value;
    let urls=`http://${ip}:7009/warehouse/halo`

    const payload={url:urls}
    this.service.checkEndpointHqWh(payload)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      {
        next: (res) => {
          let status="Connected";
          if(res?.success == false){
            status ="Disconnected"
            this.g.serverHQStatus = "DOWN";
          } 

          this.g.serverHQStatus = "UP";
          this.myForm.patchValue({
            statusConnection:status
          });
          this.loadingTest =false;
          console.log(res)
        },
        error: (error) => {
          this.myForm.patchValue({
            statusConnection:"Disconnected"
          });
          this.g.serverHQStatus = "DOWN";
          this.loadingTest =false;
            console.log(error)
        },
      }
    )
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  
}
