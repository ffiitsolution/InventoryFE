import { Component, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import isEqual from 'lodash/isEqual';
import { NgxSelectDropdownComponent } from 'ngx-select-dropdown';
import Swal from 'sweetalert2';
import moment from 'moment';
import { GlobalService } from 'src/app/service/global.service';
import { DataService } from 'src/app/service/data.service';
import { AppConfig } from '../../../config/app.config';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent {
  public loading: Boolean = false;
  public loadingDetail: Boolean = false;
  public loadingFilter: Boolean = false;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  page: number = 1;
  totalLength: number = 0;
  listLog: any = [];

  constructor(
    private toastr: ToastrService,
    private service: AppService,
    public globalService: GlobalService,
    private dataService: DataService,
    private datePipe: DatePipe,
    private http: HttpClient,
  ) { }

  @ViewChild('selectDropdownDate')
  selectDropdownDate: NgxSelectDropdownComponent;
  @ViewChild('selectDropdownTime')
  selectDropdownTime: NgxSelectDropdownComponent;
  @ViewChild('selectDropdownModule')
  selectDropdownModule: NgxSelectDropdownComponent;
  @ViewChild('selectDropdownAction')
  selectDropdownAction: NgxSelectDropdownComponent;
  @ViewChild('selectDropdownStaffCode')
  selectDropdownStaffCode: NgxSelectDropdownComponent;
  @ViewChild('selectDropdownRemark')
  selectDropdownRemark: NgxSelectDropdownComponent;
  @ViewChild('selectDropdownSuccess')
  selectDropdownSuccess: NgxSelectDropdownComponent;
  @ViewChild('selectDropdownUrl') selectDropdownUrl: NgxSelectDropdownComponent;

  errorShowMessage = 'Terjadi kesalahan dalam pengambilan Data!';
  filterText: string = '';
  menuTitle: string = 'Activity Log';
  collapses = [false, false, false, false];
  today = new Date();
  dataUser: any;

  configSelectFile: any = {
    height: '200px', // Dropdown height
  };
  listFile: any[] = [];
  selectedFile: object;

  listDetail: any[] = [];
  filteredListDetail: any[] = [];
  filters: any = {};
  columnOptions: any = {
    date: [],
    time: [],
    module: [],
    action: [],
    staffCode: [],
    remark: [],
    success: [],
    url: [],
  };

  ngOnInit() {
    // let userToken: any = this.globalService.getLocalstorage('inv_token');
    // this.dataUser = userToken ? JSON.parse(userToken) : null;

    this.getListFiles();
  }

  getListFiles() {
    this.loading = true;
    const param: any = {
      module: 'ActivityLog',
    };
    this.service.listActivityLogFiles(param).subscribe(
      (res: any) => {
        this.loading = false;
        this.listFile = res.item.reverse();
        this.configSelectFile = this.globalService.dropdownConfig(
          'filename',
          0,
          false,
          undefined,
          'Choose'
        );
      },
      (err: Error) => {
        this.loading = false;
        this.toastr.error(this.errorShowMessage, 'Maaf, Terjadi Kesalahan!');
      }
    );
  }

  getListLog() {
    this.loading = true;
    const param: any = {
      module: 'ActivityLog',
    };
    this.dataService
      .postData(AppConfig.settings.apiServer.BASE_URL + '/tomcat-logs', param).subscribe(
        (response) => {
          this.loading = false;
          const res = response.body;
          this.listLog = response.item;
        },
        (err) => {
          this.loading = false;
          this.toastr.error(this.errorShowMessage, 'Maaf, Terjadi Kesalahan!');
        }
      );
  }

  confirmDelete(fileName: any) {
    Swal.fire({
      icon: 'warning',
      title: 'Yakin ingin menghapus log?',
      showCancelButton: true,
      cancelButtonText: 'BATAL',
      confirmButtonText: 'YA, LANJUT',
      confirmButtonColor: '#B51823',
    }).then((res) => {
      if (res.isConfirmed) {
        this.page = 1;
        Swal.close();
        this.dataService.getData(AppConfig.settings.apiServer.BASE_URL + '/tomcat-logs/download/' + fileName + '/true')
          .subscribe(
            (res) => {
              if (res.success) {
                this.toastr.success('Log dihapus.', 'Berhasil!');
              }
              this.loading = false;
            },
            (err) => {
              this.loading = false;
              this.toastr.error(
                this.errorShowMessage,
                'Maaf, Terjadi Kesalahan!'
              );
            }
          );
      }
    });
  }

  confirmDownload(fileName: any) {
    Swal.fire({
      icon: 'warning',
      title: 'Yakin ingin download log?',
      showCancelButton: true,
      cancelButtonText: 'BATAL',
      confirmButtonText: 'YA, LANJUT',
      confirmButtonColor: '#B51823',
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.close();
  
        const downloadUrl = AppConfig.settings.apiServer.BASE_URL + '/tomcat-logs/download/' + fileName + '/false';
  
        this.http.get(downloadUrl, { responseType: 'blob' }).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url); // Optional: untuk membebaskan memori
            this.toastr.success('Download Tomcat log.', 'Proses selesai.');
          },
          error: () => {
            this.toastr.error('Gagal mengunduh file.', 'Terjadi kesalahan.');
          }
        });
      }
    });
  }
  

  formatTime(timestamp: string) {
    return moment(timestamp).format('YYYY-MM-DD hh:mm:ss');
  }

  isFileSelected(file: any): boolean {
    return isEqual(this.selectedFile, file);
  }

  selectFile(file: any) {
    if (file === this.selectedFile) {
      return;
    }
    this.loadingDetail = true;
    const param: any = {
      module: 'ActivityLog',
      log: file.filename,
    };
    this.selectedFile = file;
    this.service.listActivityLogFiles(param).subscribe(
      (res) => {
        this.listDetail = res.item.reverse();
        this.populateColumnOptions();
        this.applyFilters();
        this.loadingDetail = false;
      },
      (err) => {
        this.loadingDetail = false;
        this.toastr.error(this.errorShowMessage, 'Maaf, Terjadi Kesalahan!');
      }
    );
  }

  populateColumnOptions() {
    this.listDetail.forEach((item) => {
      if (!this.columnOptions.date.includes(item.date_upd || item.dateUpd)) {
        this.columnOptions.date.push(item.date_upd || item.dateUpd);
      }

      if (!this.columnOptions.time.includes(item.time)) {
        this.columnOptions.time.push(item.time);
      }

      if (!this.columnOptions.module.includes(item.module)) {
        this.columnOptions.module.push(item.module);
      }

      if (!this.columnOptions.action.includes(item.action)) {
        this.columnOptions.action.push(item.action);
      }

      if (!this.columnOptions.staffCode.includes(item.staffCode)) {
        this.columnOptions.staffCode.push(item.staffCode);
      }

      if (!this.columnOptions.remark.includes(item.remark)) {
        this.columnOptions.remark.push(item.remark);
      }

      if (!this.columnOptions.success.includes(item.success)) {
        this.columnOptions.success.push(item.success);
      }

      if (!this.columnOptions.url.includes(item.url)) {
        this.columnOptions.url.push(item.url);
      }
    });
  }

  applyFilters() {
    this.loadingFilter = true;
    const filtersSet = Object.values(this.filters).some(
      (filter) => filter !== null && filter !== undefined
    );
    if (!filtersSet) {
      this.filteredListDetail = this.listDetail;
    } else {
      this.filteredListDetail = this.listDetail.filter((item) => {
        return (
          (!this.filters.date ||
            item.date_upd === this.filters.date ||
            item.dateUpd === this.filters.date) &&
          (!this.filters.time || item.time === this.filters.time) &&
          (!this.filters.module || item.module === this.filters.module) &&
          (!this.filters.action || item.action === this.filters.action) &&
          (!this.filters.staffCode ||
            item.staffCode === this.filters.staffCode) &&
          (!this.filters.success || item.success === this.filters.success) &&
          (!this.filters.url || item.url === this.filters.url)
        );
      });
    }
    this.loadingFilter = false;
  }

  resetFilters() {
    this.loadingFilter = true;
    this.filters = {
      date: null,
      time: null,
      module: null,
      action: null,
      staffCode: null,
      success: null,
      url: null,
    };
    this.selectDropdownDate.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownDate.deselectItem(item, index);
    });
    this.selectDropdownTime.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownTime.deselectItem(item, index);
    });
    this.selectDropdownModule.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownModule.deselectItem(item, index);
    });
    this.selectDropdownAction.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownAction.deselectItem(item, index);
    });
    this.selectDropdownRemark.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownRemark.deselectItem(item, index);
    });
    this.selectDropdownStaffCode.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownStaffCode.deselectItem(item, index);
    });
    this.selectDropdownSuccess.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownSuccess.deselectItem(item, index);
    });
    this.selectDropdownUrl.selectedItems.forEach((item: any, index: any) => {
      this.selectDropdownUrl.deselectItem(item, index);
    });
    this.filteredListDetail = this.listDetail;
    this.loadingFilter = false;
  }

  selectFilter(column: string, value: any) {
    if (Array.isArray(value) && value.length === 0) {
      delete this.filters[column];
    } else {
      this.filters[column] = value;
    }
    this.applyFilters();
  }

  formatParams(params: any): string {
    return JSON.stringify(params);
  }

  exportToExcel(): void {
    // Membuat workbook baru
    const workbook = XLSX.utils.book_new();

    // Membuat worksheet baru dengan header yang sesuai
    const worksheetData = [
      ['NO', 'DATE', 'TIME', 'MODULE', 'ACTION', 'STAFF CODE', 'STAFF NAME', 'SUCCESS', 'URL', 'PARAMS'], // Header
    ];

    this.listDetail.forEach((item: any, index: any) => {
      const rowValues = [
        index + 1,
        item.dateUpd,
        item.time,
        item.module,
        item.action,
        item.staffCode,
        item.staffName,
        item.success,
        item.url,
        JSON.stringify(item.params),
      ];
      worksheetData.push(rowValues); // Menambahkan data ke worksheet
    });

    // Mengubah data menjadi worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Menambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Menulis workbook ke dalam buffer dan mengunduh file
    XLSX.writeFile(workbook, `activity-log_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '')}.xlsx`);
  }

  transformDateTime(date: string, format: string = 'dd MMM yyyy HH:mm:ss'): any {
    if (date == '-' || date == null) {
      return '-';
    }
    // Format default termasuk tanggal dan waktu
    return this.datePipe.transform(date, format);
  }
}
