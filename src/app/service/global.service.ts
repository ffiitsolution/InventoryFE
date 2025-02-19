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
import { PRINT_STATUS, STATUS_RESULT } from '../../constants';

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
  listFryer: any = [];
  listMonitoring: any = [];
  isFullscreen: boolean = false;
  audio: HTMLAudioElement = new Audio();

  // param global untuk tf data antar component
  paramCode: any;
  paramData: any;
  paramType: any;
  navbarVisibility: boolean = true;

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

  getUserAreaCode() {
    return (
      this.getLocalstorage('inv_currentUser')?.kodeRsc ||
      ''
    );
  }

  removeLocalstorage(key: string) {
    return localStorage.removeItem(key);
  }

  clearLocalstorage() {
    localStorage.removeItem('inv_locations');
    localStorage.removeItem('inv_currentUser');
    localStorage.removeItem('inv_token');
    localStorage.removeItem('inv_listMenu');
    // return localStorage.clear();
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

  transformTime(time: string) {
    if (isNull(time) || time.length < 6) {
      return '00:00';
    } else {
      const hours = time.substring(0, 2);
      const minutes = time.substring(2, 4);
      const seconds = time.substring(4, 6);
      return `${hours}:${minutes}`;
    }
  }

  transformDate(date: string, format: any = 'dd MMM yyyy') {
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
  getStatusOrderLabel(status: string, isPrintStatus: boolean = false) {
    const data = isPrintStatus ? PRINT_STATUS : STATUS_RESULT;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    return `(${status}) ${found?.label}` || status;
  }
  getsatusDeliveryOrderLabel(status: string, isPrintStatus: boolean = false) {
    const data = isPrintStatus ? PRINT_STATUS : STATUS_RESULT;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    return `(${status}) ${found?.label}` || status;
  }

  getStatusPostingLabel(status: string, isPrintStatus: boolean = false) {
    const data = isPrintStatus ? PRINT_STATUS : STATUS_RESULT;
    const found = data.find((item) => item.value == status);
    if (!found) {
      return '-';
    }
    return `(${status}) ${found?.label}` || status;
  }
  trimOutletCode(label: string) {
    const numberPattern = /\d+/g;
    const result = label.match(numberPattern);
    return result ? result[0] : null;
  }
  getUserCabangCode() {
    return 'defaultCabangCode';
  }
}
