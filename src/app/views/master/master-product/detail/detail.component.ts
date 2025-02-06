import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../service/global.service';
import { LS_INV_SELECTED_PRODUCT } from 'src/constants';
import { AppService } from 'src/app/service/app.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class MasterProductDetailComponent implements OnInit {
  uomList: any;
  defaultOrderGudangList: any;
  supplierList: any;

  configUomSelect: any;

  myForm: FormGroup;
  detail: any;
  showPassword: boolean = false;

  baseConfig: any = {
    displayKey: 'keteranganUom', // Key to display in the dropdown
    search: true, // Enable search functionality
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'keteranganUom', // Key to search
  };

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_PRODUCT));
    this.getUomList();
    this.getSupplierList();
    this.getDefaultOrderGudangList();

    this.configUomSelect = {
      displayKey: 'keteranganUom', // Label untuk ditampilkan
      search: true, // Aktifkan pencarian
      height: '300px', // Tinggi dropdown
      placeholder: 'Pilih UOM',
    };

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
      keteranganRegion: [this.detail.keteranganRegion],
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
  }

  getUomList() {
    this.service.getUomList().subscribe((res: any) => {
      this.uomList = res;
    });
  }

  getSupplierList() {
    this.service.getSupplierList().subscribe((res: any) => {
      this.supplierList = res;
    });
  }

  getDefaultOrderGudangList() {
    this.service.getDefaultOrderGudangList().subscribe((res: any) => {
      this.defaultOrderGudangList = res;
    });
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_PRODUCT);
    this.router.navigate(['/master/master-product']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-branch/edit']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
