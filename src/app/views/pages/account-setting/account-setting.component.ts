import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { cilCheck } from '@coreui/icons';
import { AlertComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { isEmpty } from 'lodash-es';
import { GlobalService } from 'src/app/service/global.service';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrl: './account-setting.component.scss'
})
export default class AccountSettingComponent implements OnInit {
  locations: any;
  selectedLanguage: string;
  currentUser: any;
  defaultLocationCode: string;
  icons = { cilCheck };
  isDefaultWarehouseExist: boolean = false;

  constructor(
    private g: GlobalService,
    private router: Router
  ) {
    this.currentUser = g.getLocalstorage('inv_currentUser');
    this.locations = g.getLocalstorage('inv_locations');
    this.selectedLanguage = g.getLocalstorage('inv_language') ?? 'id';
    if(!isEmpty(this.currentUser?.defaultLocation)) {
      this.defaultLocationCode = this.currentUser?.defaultLocation?.kodeLocation;
      this.isDefaultWarehouseExist = false;
    } else {
      this.defaultLocationCode = ''
      this.isDefaultWarehouseExist = true;
    }
  }

  ngOnInit(): void {

  }

  onSelectLanguagePressed(lang: string) { 
    this.g.saveLocalstorage('inv_language', lang, 'text');
    window.location.reload();
  }

  onSelectWarehousePressed(item: any) {
    const currentUser = this.g.getLocalstorage('inv_currentUser');
    const transformedCurrentUser = {
      ...currentUser,
      defaultLocation: item
    }
    this.g.saveLocalstorage('inv_currentUser', transformedCurrentUser);
    Swal.fire({
      title: 'Berhasil',
      icon: 'success',
      html: `Berhasil memilih ${item.keteranganLokasi}`,
      confirmButtonText: 'OK, Navigasi ke Dashboard',
      showCancelButton: false,
    }).then((v) => {
      this.router.navigate(['dashboard']).then(() => window.location.reload());
    });
  }
}
