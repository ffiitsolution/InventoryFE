import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_USER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class MasterUserDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;
  showPassword: boolean = false;
  listuserLoc: any[] = [];
  listLokasi: any[] = [];
  listDefaultLokasi: any[] = [];

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private dataService: DataService

  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(
      this.g.getLocalstorage(LS_INV_SELECTED_USER)
    );
    console.log("this.detail", this.detail);
    this.myForm = this.form.group({
      kodeUser: [this.detail.kodeUser],
      namaUser: [this.detail.namaUser],
      kodePassword: [this.detail.kodePassword],
      statusAktif: [this.detail.statusAktif],
      defaultLocation: [this.detail.keteranganLokasi],
      jabatan: [this.detail.jabatan],
      location: "",
      userCreate: [this.detail.userCreate],
      userUpdate: [this.detail.userUpdate],
      dateCreate: [this.detail.dateCreate],
      dateUpdate: [this.detail.dateUpdate], 
    });



    this.dataService
    .postData(this.g.urlServer + '/api/location/dropdown-lokasi',{})
    .subscribe((resp: any) => {
      this.listLokasi = resp.map((item: any) => ({
        id: item.KODE_LOCATION,
        name: item.KODE_LOCATION+" - "+item.KETERANGAN_LOKASI,
      }));    
      const getDefaultLocation = this.listLokasi.find(
        (item: any) => item.id === this.detail.defaultLocation
      );      
      // this.myForm.get('defaultLocation')?.setValue(getDefaultLocation);

      this.dataService
      .postData(this.g.urlServer + '/api/user-location/by-user',{"kodeUser":this.detail.kodeUser})
      .subscribe((resp: any) => {
        this.listuserLoc = resp    
        
        const listuserLocArray = this.listuserLoc.map(item => item.KODE_LOCATION);

        const filteredLokasiByUserLoc = this.listLokasi.filter(item => listuserLocArray.includes(item.id));
        this.listDefaultLokasi = filteredLokasiByUserLoc;
        const listLocations = this.listDefaultLokasi.map(item => item.name);
        const locationString = listLocations.join(",   ");

        console.log("locationString", locationString)
        this.myForm.get('location')?.setValue(locationString); 
      });
    });
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_USER);
    this.router.navigate(['/master/master-user']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-user/edit']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
