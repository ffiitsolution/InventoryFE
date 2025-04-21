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
  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };
  configSelectRole: any;
  listRole: any[] = [];

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
      roleID: [''],
      companyProfile: [this.detail.companyProfile === 'Y'],
      maintenancePassword: [this.detail.maintenancePassword === 'Y'],
      masterCabang: [this.detail.masterCabang === 'Y'],
      masterSupplier: [this.detail.masterSupplier === 'Y'],
      masterBarang: [this.detail.masterBarang === 'Y'],
      masterLain: [this.detail.masterLain === 'Y'],
      pembelian: [this.detail.pembelian === 'Y'],
      penerimaan: [this.detail.penerimaan === 'Y'],
      pengiriman: [this.detail.pengiriman === 'Y'],
      barangRusak: [this.detail.barangRusak === 'Y'],
      penyesuaianStock: [this.detail.penyesuaianStock === 'Y'],
      returnBarang: [this.detail.returnBarang === 'Y'],
      produksi: [this.detail.produksi === 'Y'],
      barangBekas: [this.detail.barangBekas === 'Y'],
      stockOpname: [this.detail.stockOpname === 'Y'],
      usulOrder: [this.detail.usulOrder === 'Y'],
      listingMaster: [this.detail.listingMaster === 'Y'],
      laporanTransaksi: [this.detail.laporanTransaksi === 'Y'],
      closing: [this.detail.closing === 'Y'],
      backupData: [this.detail.backupData === 'Y'],
      utility: [this.detail.utility === 'Y'],
      userCreate: [this.detail.userCreateName],
      userUpdate: [this.detail.userUpdateName],
      dateCreate: [moment(this.detail.dateCreate).format('DD MMM yyyy')],
      dateUpdate: [moment(this.detail.dateUpdate).format('DD MMM yyyy')],
    });
    this.myForm.disable();

    this.configSelectRole = {
      ...this.baseConfig,
      placeholder: 'Pilih Role',
      searchPlaceholder: 'Cari Role',
      limitTo: this.listRole.length,
    };

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

    this.dataService
      .postData(this.g.urlServer + '/api/role/dropdown-role', {})
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
