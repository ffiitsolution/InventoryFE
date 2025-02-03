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
      statusAktif: [
        this.detail.statusAktif 
      ],
      jabatan: [
        this.detail.jabatan 
      ],
      defaultLocation: [{}]
    });

    this.dataService
    .postData(this.g.urlServer + '/api/location/dropdown-lokasi',{})
    .subscribe((resp: any) => {
      this.listLokasi = resp.map((item: any) => ({
        id: item.KODE_LOCATION,
        name: item.KETERANGAN_LOKASI,
      }));      

      const fullDefaultLocation = this.listLokasi.find(
        (item: any) => item.id === this.detail.defaultLocation
      );

      
      this.myForm.addControl(
        'defaultLocation', ''
      );
      this.myForm.get('defaultLocation')?.setValue(fullDefaultLocation);

    });

  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
    } else {
      this.editing = true;
      const param = {
        kodeUser:  controls?.['kodeUser']?.value,
        kodePassword:  controls?.['kodePassword']?.value,
        namaUser: controls?.['namaUser']?.value,
        statusAktif: controls?.['statusAktif']?.value,
        jabatan: controls?.['jabatan']?.value,
        defaultLocation: controls?.['defaultLocation']?.value?.id
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
}
