import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_USER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';
import moment from 'moment';

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
  roleId: any;
  listPosition: any[] = [];

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private dataService: DataService
  ) {
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;
  }

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_USER));
    this.myForm = this.form.group({
      kodeUser: [this.detail.kodeUser],
      namaUser: [this.detail.namaUser],
      kodePassword: [this.detail.kodePassword],
      statusAktif: [this.detail.statusAktif],
      defaultLocation: [this.detail.keteranganLokasi],
      jabatan: [this.detail.jabatan],
      location: '',
      userCreate: [this.detail.userCreate],
      userUpdate: [this.detail.userUpdate],
      dateCreate: [moment(this.detail.dateCreate).format('DD MMM yyyy')],
      dateUpdate: [moment(this.detail.dateUpdate).format('DD MMM yyyy')],
    });
    this.myForm.disable();

    this.dataService
      .postData(this.g.urlServer + '/api/location/dropdown-lokasi', {})
      .subscribe((resp: any) => {
        this.listLokasi = resp.map((item: any) => ({
          id: item.KODE_LOCATION,
          name: item.KODE_LOCATION + ' - ' + item.KETERANGAN_LOKASI,
        }));
        const getDefaultLocation = this.listLokasi.find(
          (item: any) => item.id === this.detail.defaultLocation
        );
        // this.myForm.get('defaultLocation')?.setValue(getDefaultLocation);

        this.dataService
          .postData(this.g.urlServer + '/api/user-location/by-user', {
            kodeUser: this.detail.kodeUser,
          })
          .subscribe((resp: any) => {
            this.listuserLoc = resp;

            const listuserLocArray = this.listuserLoc.map(
              (item) => item.KODE_LOCATION
            );

            const filteredLokasiByUserLoc = this.listLokasi.filter((item) =>
              listuserLocArray.includes(item.id)
            );
            this.listDefaultLokasi = filteredLokasiByUserLoc;
            const listLocations = this.listDefaultLokasi.map(
              (item) => item.name
            );
            const locationString = listLocations.join(',   ');
            this.myForm.get('location')?.setValue(locationString);
          });
      });

    this.dataService
      .postData(this.g.urlServer + '/api/position/dropdown-position', {})
      .subscribe((resp: any) => {
        this.listPosition = resp.map((item: any) => ({
          id: item.CODE,
          name: item.DESCRIPTION,
        }));
        const getPositionID = this.listPosition.find(
          (item: any) => Number(item.id) === Number(this.detail.jabatan)
        );
        this.myForm.get('jabatan')?.setValue(getPositionID?.name);
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
