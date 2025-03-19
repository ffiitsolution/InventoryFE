import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { AppService } from '../../../service/app.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
// import * as pdfjsLib from 'pdfjs-dist';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { sortBy } from 'lodash';
import { ToastrService } from 'ngx-toastr';
// import {
//   PDFDocumentProxy,
//   PDFProgressData,
//   PdfViewerComponent,
// } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-modules-app-info',
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss',
})
export class ModulesComponent implements OnInit, OnDestroy, AfterViewInit {
  // @ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent;
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
    // pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.js';
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.entry.js';
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Modul') + ' - ' + this.g.tabTitle
    );
    this.loadingModule = true;
    this.service.getExternal(this.urlModule + '/list.json').subscribe((res) => {
      const transformResponse = res.map((i:any) => ({
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

  isSelected(selected:any): boolean {
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

  onProgress(progressData: any) {
    const total = progressData.total;
    const loaded = progressData.loaded;
    if (loaded < total) {
      this.textLoading =
        'Sedang memuat ... ' +
        loaded +
        ' / ' +
        total +
        '( ' +
        Math.round((loaded / total) * 100) +
        '% )';
    } else {
      this.textLoading = '';
    }
  }

  afterLoadComplete(pdf: any) {
    this.totalPages = pdf.numPages;
  }

  search(stringToSearch: string) {
    // this.pdfComponent.eventBus.dispatch('find', {
    //   query: stringToSearch,
    //   type: 'again',
    //   caseSensitive: false,
    //   findPrevious: false,
    //   highlightAll: true,
    //   phraseSearch: true,
    // });
  }

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

  download() {
    // if (this.pdfComponent) {
    //   const pdfViewer = this.pdfComponent.pdfViewer;
    //   if (pdfViewer) {
    //     const pdfDocument = pdfViewer.pdfDocument;
    //     if (pdfDocument) {
    //       pdfDocument.getData().then((data: Uint8Array) => {
    //         const blob = new Blob([data], { type: 'application/pdf' });
    //         const blobUrl = URL.createObjectURL(blob);
    //         window.open(blobUrl, '_blank');
    //       });
    //     }
    //   }
    // }
    window.open(this.selectedUrl, '_blank');
  }

  printPdf() {
    // if (this.pdfComponent) {
    //   const pdfViewer = this.pdfComponent.pdfViewer;
    //   if (pdfViewer) {
    //     const pdfDocument = pdfViewer.pdfDocument;
    //     if (pdfDocument) {
    //       pdfDocument.getData().then((data: Uint8Array) => {
    //         const blob = new Blob([data], { type: 'application/pdf' });
    //         const blobUrl = URL.createObjectURL(blob);
    //         const printWindow = window.open(blobUrl, '_blank');
    //         if (printWindow) {
    //           printWindow.onload = () => {
    //             printWindow.print();
    //           };
    //         } else {
    //           console.error('Failed to open print window.');
    //         }
    //         URL.revokeObjectURL(blobUrl);
    //       });
    //     }
    //   }
    // }
  }

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
    this.selectedUrl = url;
    this.selectedExtention = extention;
  }
}
