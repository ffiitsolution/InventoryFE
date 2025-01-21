import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-edit-master-user',
  templateUrl: 'edit-master-user.component.html',
  styleUrl: 'edit-master-user.component.scss',
})
export class EditMasterUserComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  user: any;
  kodeUser: any;
  loadingIndicator = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private g: GlobalService,
    translate: TranslateService
  ) {
    translate.use(localStorage.getItem('inv_language') || 'id');
  }

  ngOnInit(): void {
    this.kodeUser = this.g.paramData?.kodeUser ?? null;
    this.user = this.g.paramData?.kodeUser
      ? this.g.paramData
      : {
          backupData: '',
          pengiriman: '',
          barangRusak: '',
          timeUpdate: '',
          jabatan: '',
          stockOpname: '',
          utility: '',
          maintenancePassword: '',
          listingMaster: '',
          tokenExpiredAt: '',
          dateCreate: '',
          pembelian: '',
          namaUser: '',
          userCreate: '',
          closing: '',
          penyesuaianStock: '',
          masterCabang: '',
          usulOrder: '',
          companyProfile: '',
          kodeUser: '',
          kodePassword: '',
          statusAktif: '',
          userUpdate: ' ',
          produksi: '',
          returBarang: '',
          masterLain: '',
          laporanTransaksi: '',
          masterBarang: '',
          defaultLocation: '',
          barangBekas: '',
        };
    if (this.kodeUser === undefined || this.kodeUser === null) {
      this.backToIndex();
    }
    this.g.changeTitle('Edit User - ' + this.g.tabTitle);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('User Name:', this.user.namaUser);
      console.log('User Code:', this.user.kodeUser);
      // Here you can perform actions like saving the user data
    }
  }

  backToIndex(){
    this.router.navigate(['master/master-user']);
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {}
}
