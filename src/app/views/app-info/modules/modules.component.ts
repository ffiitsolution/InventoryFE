import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../service/app.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { sortBy } from 'lodash';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modules-app-info',
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss',
})
export class ModulesComponent implements OnInit, OnDestroy, AfterViewInit {
  urlModule: string = 'http://192.168.10.28/module_backoffice';
  searchSelected = '';
  textLoading = '';
  pdfDoc: any;
  pageNum: any = 1;
  totalPages: number = 0;
  pageNumber: number = 1;
  pageRendering: boolean = false;
  pageNumPending: any = null;
  canvas: any;
  ctx: any;
  searchList: any[] = [];
  arr: any;
  loadingModule: boolean = false;
  selectedUrl: string = '';
  selectedExtention: String = '';

  fileUrl: SafeResourceUrl;

  constructor(
    private service: AppService,
    public g: GlobalService,
    private toastr: ToastrService,
    private translation: TranslationService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadingModule = true;
    this.service.getExternal(this.urlModule + '/list.json').subscribe((res) => {
      const transformResponse = res.map((i: any) => ({
        ...i,
        num: Number(i.num),
        title: i.name,
      }));
      this.arr = sortBy(transformResponse, 'num');
      this.loadingModule = false;
    });
  }

  ngOnDestroy(): void {}

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {}

  isSelected(selected: any): boolean {
    return selected === this.searchSelected;
  }

  onPrevPage(): void {
    if (this.pageNum <= 1) {
      return;
    }
    this.pageNum--;
  }

  onNextPage(): void {
    if (this.pageNum >= this.totalPages) {
      return;
    }
    this.pageNum++;
  }

  goToPage(pageNumber: number = this.pageNumber): void {
    this.pageNumber = pageNumber;
    if (this.pageNumber >= 1 && this.pageNumber <= this.totalPages) {
      this.pageNum = this.pageNumber;
    }
  }

  onProgress(event: any) {
    const percentage = Math.round(event.percent || 0);
    if (percentage > 0 && percentage < 100) {
      const loadedMB = (event.loaded / (1024 * 1024)).toFixed(1);
      const totalMB = (event.total / (1024 * 1024)).toFixed(1);
      this.textLoading =
        'Loading PDF... ' +
        loadedMB +
        ' of ' +
        totalMB +
        ' MB (' +
        percentage +
        '%)';
    } else {
      this.textLoading = '';
    }
  }

  afterLoadComplete(event: any) {
    this.totalPages = event.pagesCount ?? 0;
  }

  search(stringToSearch: string) {}

  scrollTo(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const linkText = target.textContent?.trim();
    if (linkText) {
      this.searchSelected = linkText;
      this.search(linkText);
    }
  }

  enterFullscreen() {
    const element = document.getElementById('pdfViewer');
    if (element != null && element.requestFullscreen) {
      element.requestFullscreen();
    }
  }

  download(event: any | undefined) {
    window.open(this.selectedUrl, '_blank');
  }

  printPdf() {}

  handlePdfError(event: any) {
    let message = event?.message ?? event;
    if (message.includes('Cannot load script')) {
      message = 'Failed to get script from internet.';
    } else if (message.includes('Failed to fetch')) {
      message = 'Failed to get PDF file.';
    }
    this.toastr.error(message, 'Error loading PDF: ');
    this.cdr.detectChanges();
  }

  onModulSelect(fileName: String, extention: String) {
    const url = `${this.urlModule}/${fileName}`;
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.selectedExtention = extention;
    this.selectedUrl = url;
  }
}
