import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_VIEW,
  LS_INV_SELECTED_UOM,
} from '../../../../constants';
import { Router } from '@angular/router';
import { Page } from '../../../model/page';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { AppService } from '../../../service/app.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-index-sync-data',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class AllSyncDataComponent implements OnInit, OnDestroy, AfterViewInit {
  loadings: { [key: string]: boolean } = {};
  clicked: { [key: string]: boolean } = {};
  messages: { [key: string]: string } = {};
  columns: any;
  page: any;
  // page = new Page();
  data: any;
  selectedRowData: any;
  verticalItemCount: number = 6;
  reportCategoryData: any;
  selectedMenu: string = 'Kirim Data Transaksi';
  companyProfile: any = {};
  userData: any;
  listBackupDb: any[] = [];

  constructor(
    private service: AppService,
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Kirim') +
        ' ' +
        this.translation.instant('Terima') +
        ' Data - ' +
        this.g.tabTitle
    );
    this.getCompanyProfile();
    this.userData = this.service.getUserData();
  }

  ngOnDestroy(): void {}

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {}

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  onCategoryClick(category: any) {
    this.g.selectedReportCategory = category;
  }

  onClickMenu(menu: string) {
    this.selectedMenu = menu;
    // this.router.navigate([menu.path], {
    //   queryParams: { report: menu.name },
    //   skipLocationChange: true,
    // });
  }

  getCompanyProfile() {
    this.service.insert('/api/profile/company', {}).subscribe({
      next: (res) => {
        const data = res ?? {};
        this.companyProfile = data;
      },
      error: (err) => {
        console.log('err: ' + err);
      },
    });
  }

  processBackupDb() {
    this.loadings['processBackupDb'] = true;
    this.messages['processBackupDb'] = '';
    Swal.fire({
      ...this.g.componentKonfirmasiSimpan,
      showConfirmButton: false,
      showCancelButton: false,
      width: '600px',
      customClass: {
        popup: 'custom-popup',
      },
      allowOutsideClick: false,
      didOpen: () => {
        const submitBtn = document.getElementById('btn-submit');
        const cancelBtn = document.getElementById('btn-cancel');
        submitBtn?.addEventListener('click', () => {
          Swal.close();
          this.service
            .insert('/api/backup-database/process', {
              process: true,
              kodeGudang: this.userData?.defaultLocation?.kodeLocation,
            })
            .subscribe({
              next: (res) => {
                if (res.error) {
                  this.messages['processBackupDb'] = res.error;
                } else {
                  this.toastr.success('Backup database berhasil dilakukan');
                  this.getListBackup();
                }
                this.loadings['processBackupDb'] = false;
              },
              error: (err) => {
                console.log('err: ' + err);
                this.loadings['processBackupDb'] = false;
              },
            });
        });
        cancelBtn?.addEventListener('click', () => {
          Swal.close();
          this.loadings['processBackupDb'] = false;
        });
      },
    });
  }

  getListBackup() {
    this.loadings['getListBackup'] = true;
    this.clicked['getListBackup'] = true;
    this.service
      .insert('/api/backup-database/process', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
      })
      .subscribe({
        next: (res) => {
          if (res.error) {
            this.messages['getListBackup'] = res.error;
          } else {
            this.listBackupDb = res.item ?? [];
          }
          this.loadings['getListBackup'] = false;
        },
        error: (err) => {
          console.log('err: ' + err);
          this.loadings['getListBackup'] = false;
        },
      });
  }

  deleteBackup(data: any) {
    this.loadings['deleteBackup'] = true;
    Swal.fire({
      ...this.g.componentKonfirmasiSimpan,
      showConfirmButton: false,
      showCancelButton: false,
      width: '600px',
      customClass: {
        popup: 'custom-popup',
      },
      allowOutsideClick: false,
      didOpen: () => {
        const submitBtn = document.getElementById('btn-submit');
        const cancelBtn = document.getElementById('btn-cancel');
        submitBtn?.addEventListener('click', () => {
          Swal.close();
          this.service
            .insert('/api/backup-database/process', {
              kodeGudang: this.userData?.defaultLocation?.kodeLocation,
              delete: data.fileName,
              download: false,
            })
            .subscribe({
              next: (res) => {
                if (res.error) {
                  this.messages['deleteBackup'] = res.error;
                  this.service.handleErrorResponse(res);
                } else {
                  this.toastr.success('Hapus backup berhasil dilakukan');
                }
                this.loadings['deleteBackup'] = false;
                this.getListBackup();
              },
              error: (err) => {
                console.log('err: ' + err);
                this.loadings['deleteBackup'] = false;
              },
            });
        });
        cancelBtn?.addEventListener('click', () => {
          Swal.close();
          this.loadings['processBackupDb'] = false;
        });
      },
    });
  }

  downloadBackup(data: any) {
    const url =
      this.service.getBaseUrl() + '/api/backup-database/download/' + data.fileName;
    window.open(url, '_blank');
  }
}
