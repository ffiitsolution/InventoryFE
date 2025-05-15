import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../config/app.config';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { isNull } from 'lodash-es';
import {
  PRINT_STATUS,
  STATUS_AKTIF,
  STATUS_RESULT,
  TIPE_PEMBAYARAN,
  STATUS_PESANAN_TERIMA_PESANAN,
  STATUS_PESANAN_TERIMA_PO,
  STATUS_KIRIM_PESANAN_KE_GUDANG,
} from '../../constants';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  tabTitle = 'Inventory Management System | PT FAST FOOD INDONESIA';
  protected config = AppConfig.settings.apiServer;
  urlServer = this.config.BASE_URL;
  currentUser = {};
  currentTime = '';
  currentDate = '';
  countdownValue = 0;

  private functions: { [key: string]: () => void } = {};
  appVersion: string = '0.0.3';
  commandInput: string = '';
  serverStatus: string = 'DOWN';
  serverHQStatus: string = 'DOWN';
  listFryer: any = [];
  listMonitoring: any = [];
  isFullscreen: boolean = false;
  audio: HTMLAudioElement = new Audio();
  appInfo: any = {};
  footerAlert: string = 'Silahkan entry kode resep.';
  // param global untuk tf data antar component
  paramCode: any;
  paramData: any;
  paramType: any;
  navbarVisibility: boolean = true;
  fTransDate: string = '';
  selectedReportCategory: any = null;
  statusEndOfMonth: any = '';
  statusPlanningOrder: any = '';
  statusBackupDb: any = '';
  componentKonfirmasiPosting: any = {
    title:
      '<div style="color: white; background: #c0392b; padding: 12px 20px; font-size: 18px;">Konfirmasi Proses Posting Data</div>',
    html: `
       <div style="font-weight: bold; font-size: 16px; margin-top: 10px;">
         <p>Pastikan Semua Data Sudah Di Input Dengan Benar,<br><strong>PERIKSA SEKALI LAGI...!!</strong></p>
         <p class="text-danger" style="font-weight: bold;">DATA YANG SUDAH DI POSTING TIDAK DAPAT DIPERBAIKI ..!!</p>
       </div>
       <div class="divider my-3"></div>
       <div class="d-flex justify-content-center gap-3 mt-3">
         <button class="btn btn-info text-white btn-150 pe-3" id="btn-submit">
           <i class="fa fa-check pe-2"></i> Proses Posting
         </button>
         <button class="btn btn-secondary text-white btn-150" id="btn-cancel">
           <i class="fa fa-times pe-1"></i> Batal Proses
         </button>
       </div>
     `,
  };

  componentKonfirmasiSimpan: any = {
    title:
      '<div style="color: white; background: #c0392b; padding: 12px 20px; font-size: 18px;">Konfirmasi Proses Simpan Data</div>',
    html: `
    <div style="font-weight: bold; font-size: 16px; margin-top: 10px;">
      <p>Pastikan Semua Data Sudah Di Input Dengan Benar,<br><strong>PERIKSA SEKALI LAGI...!!</strong></p>
      <p class="text-danger" style="font-weight: bold;">DATA YANG SUDAH DI POSTING TIDAK DAPAT DIPERBAIKI ..!!</p>
    </div>
    <div class="divider my-3"></div>
    <div class="d-flex justify-content-center gap-3 mt-3">
      <button class="btn btn-info text-white btn-150 pe-3" id="btn-submit">
        <i class="fa fa-check pe-2"></i> Proses Simpan
      </button>
      <button class="btn btn-secondary text-white btn-150" id="btn-cancel">
        <i class="fa fa-times pe-1"></i> Batal Proses
      </button>
    </div>
  `,
  };

  componentKonfirmasiKirim: any = {
    title:
      '<div style="color: white; background: #c0392b; padding: 12px 20px; font-size: 18px;">Konfirmasi Proses Kirim Data</div>',
    html: `
    <div style="font-weight: bold; font-size: 16px; margin-top: 10px;">
      <p>Pastikan Semua Data Sudah Di Input Dengan Benar,<br><strong>PERIKSA SEKALI LAGI...!!</strong></p>
    </div>
    <div class="divider my-3"></div>
    <div class="d-flex justify-content-center gap-3 mt-3">
      <button class="btn btn-info text-white btn-150 pe-3" id="btn-submit">
        <i class="fa fa-check pe-2"></i> Proses Kirim
      </button>
      <button class="btn btn-secondary text-white btn-150" id="btn-cancel">
        <i class="fa fa-times pe-1"></i> Batal Proses
      </button>
    </div>
  `,
  };

  constructor(
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  saveLocalstorage(key: string, value: any, type: string | boolean = 'json') {
    if (type === 'json' || type === true) {
      value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
  }

  getLocalstorage(key: string) {
    let data = localStorage.getItem(key);
    if (data && /^\s*["{\[]/.test(data ?? '')) {
      return JSON.parse(data ?? '');
    } else if (data) {
      return data;
    } else {
      return null;
    }
  }

  getUserCode() {
    return this.getLocalstorage('inv_currentUser')?.kodeUser || '';
  }
  getUserLocationCode() {
    return (
      this.getLocalstorage('inv_currentUser')?.defaultLocation?.kodeLocation ||
      ''
    );
  }

  getUserKodeSingkat() {
    return (
      this.getLocalstorage('inv_currentUser')?.defaultLocation?.kodeSingkat ||
      ''
    );
  }

  getUserAreaCode() {
    return this.getLocalstorage('inv_currentUser')?.kodeRsc || '';
  }

  removeLocalstorage(key: string) {
    return localStorage.removeItem(key);
  }

  clearLocalstorage() {
    // localStorage.removeItem('inv_locations');
    // localStorage.removeItem('inv_currentUser');
    // localStorage.removeItem('inv_token');
    // localStorage.removeItem('inv_listMenu');
    sessionStorage.clear();
    return localStorage.clear();
  }

  getLocalDateTime(date: Date) {
    const offset = date.getTimezoneOffset() * 60000; // Offset dalam milidetik
    const localISOTime = new Date(date.getTime() - offset).toISOString();
    return localISOTime;
  }

  changeTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  getTitle() {
    return this.titleService.getTitle();
  }

  alertCreate(options: SweetAlertOptions): any {
    return Swal.fire(options);
  }

  alertSuccess(title: string, message: string): Promise<any> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal-button-width',
        cancelButton: 'swal-button-width',
      },
    });
  }

  alertWarning(title: string, message: string): Promise<any> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal-button-width',
        cancelButton: 'swal-button-width',
      },
    });
  }

  alertError(title: string, message: string): Promise<any> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal-button-width',
        cancelButton: 'swal-button-width',
      },
    });
  }

  alertInfo(title: string, message: string): Promise<any> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'swal-button-width',
        cancelButton: 'swal-button-width',
      },
    });
  }

  alertConfirm(
    title: string,
    message: string,
    confirmButtonText: string = 'OK',
    cancelButtonText: string = 'Cancel'
  ): Promise<any> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      confirmButtonText: confirmButtonText,
      showCancelButton: true,
      cancelButtonText: cancelButtonText,
      customClass: {
        confirmButton: 'swal-button-width',
        cancelButton: 'swal-button-width',
      },
    });
  }

  playSound(type: string) {
    this.audio.src = 'assets/sounds/' + type + '.mp3';
    this.audio?.load();
    this.audio?.play();
  }

  isFullScreen(): boolean {
    return !!this.document.fullscreenElement;
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.querySelector('body')?.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  containsOnlyNumbers(inputString: string) {
    return /^\d+$/.test(inputString);
  }

  removeLeadingZeros(str: string) {
    return str.replace(/^0+/, '');
  }

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  registerFunction(key: string, func: () => void): void {
    this.functions[key] = func;
  }

  executeFunction(key: string): void {
    const func = this.functions[key];
    if (func) {
      func();
    } else {
      console.error(`No function registered with key: ${key}`);
    }
  }

  transformTime(time: string, showSecond: boolean = false) {
    if (isNull(time)) {
      return '00:00';
    } else {
      const hours = time.substring(0, 2);
      const minutes = time.substring(2, 4);
      const seconds = time.substring(4, 6);
      if (showSecond) {
        return `${hours}:${minutes}:${seconds}`;
      }
      return `${hours}:${minutes}`;
    }
  }

  transformDate(date: string, format: any = 'dd MMM yyyy') {
    if (date == '-' || date == null) {
      return '-';
    }
    return this.datePipe.transform(date, format);
  }

  transformDateTime(
    date: string,
    time: string,
    dateFormat: any = 'dd MMM yyyy'
  ) {
    return `${this.transformDate(date)} - ${this.transformTime(time)}`;
  }

  markAllAsTouched(myForm: any) {
    Object.keys(myForm.controls).forEach((field) => {
      const control = myForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
  isFieldValid(myForm: any, fieldName: any) {
    return (
      myForm.controls?.[fieldName]?.touched &&
      myForm.controls?.[fieldName]?.errors
    );
  }
  getStatusOrderLabel(status: string, isPrintStatus: boolean = false, isShowBadge: boolean = false): string {
    const data = isPrintStatus ? PRINT_STATUS : STATUS_RESULT;
    const found = data.find((item) => item.value === status);
    if (!found) {
      return '';
    }

    let badgeClass = 'bg-secondary';

    switch (found.value) {
      case 'S':
      case '2':
      case 'P':
        badgeClass = 'bg-success';
        break;
      case '1':
        badgeClass = 'bg-info';
        break;
      case 'B':
        badgeClass = 'bg-secondary';
        break;
      case 'I':
        badgeClass = 'bg-warning';
        break;
      // Tambahkan case lainnya jika ada
    }

    let labelStatus = '';
    if (isShowBadge) {
      labelStatus = `<span class="badge ${badgeClass}">${found.label.toUpperCase()}</span>`;
    } else {
      labelStatus = `${found?.label?.toUpperCase()}` || status;
    }
    return labelStatus;

  }

  getsatusDeliveryOrderLabel(status: string, isPrintStatus: boolean = false) {
    const data = isPrintStatus ? PRINT_STATUS : STATUS_RESULT;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    // return `(${status}) ${found?.label}` || status;
    return `${found?.label?.toUpperCase()}` || status;
  }

  getStatusPostingLabel(status: string, isPrintStatus: boolean = false) {
    const data = isPrintStatus ? PRINT_STATUS : STATUS_RESULT;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    // return `(${status}) ${found?.label}` || status;
    return `${found?.label?.toUpperCase()}` || status;
  }

  getTipePembayaranLabel(status: string) {
    const data = TIPE_PEMBAYARAN;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    return `${found?.label}` || status;
  }

  getStatusAktifLabel(status: string, isShowBadge: boolean = false) {
    const data = STATUS_AKTIF;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    let badgeClass = 'bg-secondary';

    switch (found.value) {
      case 'A':
        badgeClass = 'bg-success';
        break;
      case 'T':
        badgeClass = 'bg-danger';
        break;
      // Tambahkan case lainnya jika ada
    }

    let labelStatus = '';
    if (isShowBadge) {
      labelStatus = `<span class="badge ${badgeClass}">${found.label.toUpperCase()}</span>`;
    } else {
      labelStatus = `${found?.label?.toUpperCase()}` || status;
    }
    return labelStatus;

  }

  getStatusReceivingOrderLabel(status: string, isPrintStatus: boolean = false) {
    const data = STATUS_PESANAN_TERIMA_PESANAN;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    // return `(${status}) ${found?.label}` || status;
    return `${found?.label?.toUpperCase()}` || status;
  }
  getStatusReceivingOrderBadge(status: string): string {
    console.log('status', status);
    const data = STATUS_PESANAN_TERIMA_PESANAN;
    const found = data.find((item) => item.value === status);
    if (!found) return status;

    return `
      <span style="
        background-color: ${found.color}; 
        color: ${found.textColor}; 
        padding: 4px 10px; 
        border-radius: 4px; 
        font-weight: 500;
        font-size: 0.85rem;
        display: inline-block;
      ">
        ${found.label}
      </span>`;
  }

  getStatusReceivingPOLabel(status: string, isPrintStatus: boolean = false) {
    const data = STATUS_PESANAN_TERIMA_PO;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    // return `(${status}) ${found?.label}` || status;
    return `${found?.label?.toUpperCase()}` || status;
  }

  getStatusReceivingPOBadge(status: string): string {
    console.log('status', status);
    const data = STATUS_PESANAN_TERIMA_PO;
    const found = data.find((item) => item.value === status);
    if (!found) return status;

    return `
      <span style="
        background-color: ${found.color}; 
        color: ${found.textColor}; 
        padding: 4px 10px; 
        border-radius: 4px; 
        font-weight: 500;
        font-size: 0.85rem;
        display: inline-block;
      ">
        ${found.label}
      </span>`;
  }

  getStatusKirimPesananGudangLabel(
    status: string,
    isPrintStatus: boolean = false
  ): string {
    const data = STATUS_KIRIM_PESANAN_KE_GUDANG;
    const found = data.find((item) => item.value === status);
    if (!found) {
      return '-';
    }
    return `${found.label.toUpperCase()}` || status;
  }
  getStatusKirimPesananGudangBadge(status: string): string {
    const data = STATUS_KIRIM_PESANAN_KE_GUDANG;
    const found = data.find((item) => item.value === status);
    if (!found) return status;

    return `
      <span style="
        background-color: ${found.color}; 
        color: ${found.textColor}; 
        padding: 4px 10px; 
        border-radius: 4px; 
        font-weight: 500;
        font-size: 0.85rem;
        display: inline-block;
      ">
        ${found.label}
      </span>`;
  }

  trimOutletCode(label: string) {
    const numberPattern = /\d+/g;
    const result = label.match(numberPattern);
    return result ? result[0] : null;
  }
  getUserCabangCode() {
    return 'defaultCabangCode';
  }

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type === 'numberPlusMinusDot'
        ? /^[0-9.+-]$/
        : type == 'alphanumeric'
        ? /^[a-zA-Z0-9]$/
        : type == 'numeric'
        ? /^[0-9]$/
        : type == 'numericDot'
        ? /^[0-9.]$/
        : type == 'phone'
        ? /^[0-9-]$/
        : type == 'email'
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'excludedSensitive'
        ? /^[a-zA-Z0-9 .,_@-]*$/
        : type == 'kodeSingkat'
        ? /^[a-zA-Z]+$/
        : /^[a-zA-Z.() ,\-]*$/;

    if (temp_regex.test(inp)) {
      // ⭐ Tambahkan ini:
      if (event.target && (event.target as HTMLInputElement).value == '0.00') {
        (event.target as HTMLInputElement).value = ''; // kosongkan langsung
      }
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  dropdownConfig(
    name: string,
    limit: number = 15,
    selectAll: boolean = false,
    search: boolean = true,
    placeholder: string = 'Pilih salah satu ...'
  ) {
    var result = {
      displayKey: name,
      search: search,
      height: '400px',
      placeholder: placeholder,
      customComparator: () => {},
      limitTo: limit,
      moreText: 'lainnya...',
      noResultsFound: 'Tidak ditemukan!',
      searchPlaceholder: 'Cari ...',
      searchOnKey: name,
      clearOnSelection: false,
      inputDirection: 'ltr',
      selectAllLabel: 'Pilih Semua',
      enableSelectAll: selectAll,
    };
    return result;
  }

  formatUrlSafeString(input: string): string {
    if (!input) {
      return '';
    }
    return input
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ' ')
      .replace(/\s+/g, '-');
  }

  formatToDecimal(value: any): string {
    const num = Number(value);
    return isNaN(num) ? '' : num.toFixed(2);
  }

  sumTotalQtyItem(
    qtyBesar: number,
    qtyKecil: number,
    konversi: number
  ): number {
    return Number(qtyBesar) * Number(konversi) + Number(qtyKecil);
  }

  generateNumberRange(start: number, end: number): number[] {
    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  convertKeysToCamelCase(obj: any): any {
    const newObj: any = {};

    Object.keys(obj).forEach((key) => {
      // Convert UPPERCASE_UNDERSCORE to camelCase
      const camelCaseKey = key
        .toLowerCase()
        .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

      newObj[camelCaseKey] = obj[key]; // Assign value to new key
    });

    return newObj;
  }

  formatStrDateMMM(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD MMM yyyy');
  }

  convertToRupiah(value: number | string): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      return '';
    }
    return (
      'Rp. ' +
      numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  parseRupiahToNumber(formatted: string): number {
    if (formatted) {
      const cleaned = formatted.replace(/[^\d]/g, ''); // hapus semua selain angka
      return parseInt(cleaned, 10) || 0;
    } else {
      return 0;
    }
  }

  formatNumberId(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
