import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { GlobalService } from 'src/app/service/global.service';
import { LS_INV_SELECTED_BRANCH } from 'src/constants';
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class MasterBranchDetailComponent implements OnInit {
  myForm: FormGroup;
  detail: any;
  showPassword: boolean = false;
  group: any;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService
  ) {}

  ngOnInit(): void {
    this.group = this.g.getLocalstorage('inv_tab_title');
    let kodeGroup;
    if (this.group === 'Branch') {
      kodeGroup = 'C';
    } else if (this.group === 'Department') {
      kodeGroup = 'D';
    } else if (this.group === 'Gudang') {
      kodeGroup = 'G';
    }
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_BRANCH));
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
      statusAktif: [this.detail.statusAktif],
      ip: [this.detail.alamatIp],
      port: [this.detail.alamatPort],
      cad1: [this.detail.cad1],
      userCreate: [this.detail.userCreate],
      userUpdate: [this.detail.userUpdate],
      dateCreate: [moment(this.detail.dateCreate).format('DD MMM yyyy')],
      dateUpdate: [moment(this.detail.dateUpdate).format('DD MMM yyyy')],
    });
    this.myForm.disable();
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_BRANCH);
    this.router.navigate(['/master/master-branch']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-branch/edit']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
