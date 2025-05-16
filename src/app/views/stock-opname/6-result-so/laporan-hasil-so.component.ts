import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { AppService } from '../../../service/app.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataService } from '../../../service/data.service';
import { AppConfig } from '../../../config/app.config';

@Component({
  selector: 'app-master-report',
  templateUrl: './laporan-hasil-so.component.html',
  styleUrl: './laporan-hasil-so.component.scss',
})
export class LaporanHasilSo implements OnInit, OnDestroy, AfterViewInit {
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  formData: any = {}
  alreadyPrint: boolean;
  disabledPrintButton: any;
  paramGenerateReport: any = {}
  isShowModalReport: boolean = false;
  paramUpdateReport: any = {}
  protected config = AppConfig.settings.apiServer;

  constructor(
    private service: AppService,
    private g: GlobalService,
    private dataService: DataService,
  ) {
  }

  ngOnInit(): void {
    this.getDataSo();
  }

  ngOnDestroy(): void { }

  ngAfterViewInit(): void { }

  getDataSo() {
    const params = {
      kodeGudang: this.g.getUserLocationCode()
    };

    this.dataService
      .postData(
        this.config.BASE_URL + '/api/stock-opname/laporan-hasil-so',
        params
      ).subscribe(
        (res) => {
          this.formData = res.item[0]
          this.formData.tanggalSo = this.g.transformDate(this.formData.tanggalSo);
          const now = new Date();
          this.paramGenerateReport = {
            isDownloadCsv: false,
            nomorSo: this.formData.nomorSo,
            userCetak: this.g.getLocalstorage('inv_currentUser').namaUser,
            tglCetak: now.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short', // atau 'long' untuk "April"
              year: 'numeric'
            }), // hasil: 30 Apr 2025
          
            jamCetak: now.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }) // hasil: sil: 13:
          }
          setTimeout(() => {
          }, 1000);
        }
      );
  }


  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  onShowModalReport() {
    this.isShowModalReport = true;
  }
}
