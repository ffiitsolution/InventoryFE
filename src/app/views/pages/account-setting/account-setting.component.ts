import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { cilCheck } from '@coreui/icons';
import { AlertComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { isEmpty } from 'lodash-es';
import { GlobalService } from 'src/app/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { DEFAULT_DELAY_TIME } from 'src/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrl: './account-setting.component.scss',
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
    private router: Router,
    private toastr: ToastrService,
    private translation: TranslateService,
    private service: AppService
  ) {
    this.currentUser = g.getLocalstorage('inv_currentUser');
    this.locations = g.getLocalstorage('inv_locations');
    this.selectedLanguage = g.getLocalstorage('inv_language') ?? 'id';
    if (!isEmpty(this.currentUser?.defaultLocation)) {
      this.defaultLocationCode =
        this.currentUser?.defaultLocation?.kodeLocation;
      this.isDefaultWarehouseExist = false;
    } else {
      this.defaultLocationCode = '';
      this.isDefaultWarehouseExist = true;
    }
  }

  ngOnInit(): void {}

  onSelectLanguagePressed(lang: string) {
    this.g.saveLocalstorage('inv_language', lang, 'text');
    window.location.reload();
  }

  onSelectWarehousePressed(item: any) {
    const currentUser = this.g.getLocalstorage('inv_currentUser');
    const transformedCurrentUser = {
      ...currentUser,
      defaultLocation: item,
    };
    Swal.fire({
      title: `Peringatan !`,
      icon: 'warning',
      html: `Apakah anda yakin untuk berpindah ke ${item.keteranganLokasi}?`,
      showCancelButton: true,
      confirmButtonText: 'Iya, Berpindah Gudang',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        const param = {
          kodeUser: this.currentUser?.kodeUser,
          // kodePassword: controls?.['kodePassword']?.value,
          // namaUser: controls?.['namaUser']?.value,
          // statusAktif: controls?.['statusAktif']?.value,
          // jabatan: controls?.['jabatan']?.value,
          defaultLocation:
            transformedCurrentUser?.defaultLocation?.kodeLocation,
          // roleID: controls?.['roleID']?.value?.id ?? ' ',
        };
        console.log();
        this.service.patch('/api/users/current', param).subscribe({
          next: (res: any) => {
            if (!res.success) {
              this.service.handleErrorResponse(res);
            } else {
              this.toastr.success(this.translation.instant('Berhasil!'));
              setTimeout(() => {
                this.g.clearLocalstorage();
                this.router.navigate(['/login']);
              }, DEFAULT_DELAY_TIME);
            }
          },
          error: (err: any) => {
            console.error('Error updating user:', err);
            this.toastr.error('An error occurred while updating the user.');
          },
        });
        // this.g.saveLocalstorage('inv_currentUser', transformedCurrentUser);
        // this.router
        //   .navigate(['dashboard'])
        //   .then(() => window.location.reload());
      }
    });
  }
}
