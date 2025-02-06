import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../service/global.service';
import { LS_INV_SELECTED_PRODUCT } from 'src/constants';
import { AppService } from 'src/app/service/app.service';
import { flagSet } from '@coreui/icons';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class MasterProductDetailComponent implements OnInit {
  uomList: any;
  supplierList: any;
  defaultOrderGudangList: any;

  configUomSelect: any;
  configSupplierSelect: any;
  configDefaultGudangSelect: any;

  detail: any;
  myForm: FormGroup;

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
      disabled: true,
      displayKey: 'keteranganUom',
      search: true,
      height: '300px',
      placeholder: 'Pilih Satuan',
    };

    this.configDefaultGudangSelect = {
      disabled: true,
      displayKey: 'kodeSingkatan',
      search: true,
      height: '300px',
      placeholder: 'Pilih Default Gudang',
    };

    this.configSupplierSelect = {
      disabled: true,
      displayKey: 'namaSupplier',
      search: true,
      height: '300px',
      placeholder: 'Pilih Supplier',
    };

    this.myForm = this.form.group({
      kodeBarang: [this.detail.kodeBarang],
      namaBarang: [this.detail.namaBarang],
      konversi: [this.detail.konversi.toFixed(2)],
      satuanKecil: [this.detail.satuanKecil],
      satuanBesar: [this.detail.satuanBesar],
      defaultGudang: [this.detail.defaultGudang],
      defaultSupplier: [this.detail.defaultSupplier],
      flagCom: [this.detail.flagCom === 'Y'],
      flagDry: [this.detail.flagDry === 'Y'],
      flagPrd: [this.detail.flagPrd === 'Y'],
      flagMkt: [this.detail.flagMkt === 'Y'],
      flagCtr: [this.detail.flagCtr === 'Y'],
      flagHra: [this.detail.flagHra === 'Y'],
      flagExpired: [this.detail.flagExpired],
      flagBrgBekas: [this.detail.flagBrgBekas],
      flagResepProduksi: [this.detail.flagResepProduksi],
      flagConversion: [this.detail.flagConversion],
      others2: [this.detail.others2],
      minStock: [this.detail.minStock.toFixed(2)],
      maxStock: [this.detail.maxStock.toFixed(2)],
      minOrder: [this.detail.minOrder.toFixed(2)],
      satuanMinOrder: [this.detail.satuanMinOrder],
      panjang: [this.detail.panjang.toFixed(2)],
      lebar: [this.detail.lebar.toFixed(2)],
      tinggi: [this.detail.tinggi.toFixed(2)],
      volume: [this.detail.volume.toFixed(2)],
      berat: [this.detail.berat.toFixed(2)],
      lokasiBarang: [this.detail.lokasiBarang],
      statusAktif: [this.detail.statusAktif],
      keteranganBrg: [this.detail.keteranganBrg],
    });
    this.myForm.disable();
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
}
