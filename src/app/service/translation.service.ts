import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(private translate: TranslateService) {
    let lang = localStorage.getItem('inv_language') || 'id';
    this.setLanguage(lang.replace('"', '')).catch((error) => {
      console.error('Failed to set default language:', error);
    });
  }

  initialize() {
    this.checkLanguage();
    const defaultLanguage = localStorage.getItem('inv_language') || 'id';
    this.translate.setDefaultLang(defaultLanguage);
    this.translate.use(defaultLanguage);
  }

  checkLanguage() {
    const selectedLanguage = localStorage.getItem('inv_language');
    if (!selectedLanguage) {
      localStorage.setItem('inv_language', 'id');
    }
  }

  async setLanguage(language: string): Promise<void> {
    try {
      this.translate.setDefaultLang(language);
      await firstValueFrom(this.translate.use(language));
      await firstValueFrom(this.translate.reloadLang(language));
    } catch (error) {
      throw new Error('Failed to set language: ' + error);
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }

  instant(key: string): string {
    return this.translate.instant(key);
  }

  async switchLanguage(language: string): Promise<void> {
    try {
      localStorage.setItem('inv_language', language);
      await firstValueFrom(this.translate.use(language));
      await firstValueFrom(this.translate.reloadLang(language));
    } catch (error) {
      throw new Error('Failed to switch language: ' + error);
    }
  }

  // bahasa Indonesia datatable
  idDatatable: any = {
    decimal: ',',
    emptyTable: 'Tidak ada entri untuk ditampilkan',
    info: 'Menampilkan _START_ hingga _END_ dari _TOTAL_',
    infoEmpty: 'Tidak ada entri untuk ditampilkan',
    infoFiltered: '(disaring dari total _MAX_ entri)',
    infoPostFix: '',
    thousands: '.',
    lengthMenu: 'Tampilkan _MENU_ entri',
    loadingRecords: 'Memuat...',
    processing: '',
    search: 'Cari: ',
    zeroRecords: 'Tidak ada data yang sesuai',
    paginate: {
      first: 'Pertama',
      last: 'Terakhir',
      next: 'Berikutnya',
      previous: 'Sebelumnya',
    },
    aria: {
      orderable: 'Urutkan berdasarkan kolom ini',
      orderableReverse: 'Urutan terbalik kolom ini',
    },
  };
}
