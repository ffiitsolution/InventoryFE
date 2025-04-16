import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { DataService } from '../../service/data.service';
import { GlobalService } from '../../service/global.service';
import { AppConfig } from '../../config/app.config';

@Component({
  selector: 'app-print-button',
  templateUrl: './print-button.component.html',
  styleUrls: ['./print-button.component.scss']
})
export class PrintButtonSharedComponent {
  @Input() alreadyPrint: boolean = false;
  @Input() rejectingOrder: boolean = false;
  @Input() disabledPrintButton: boolean = false;
  @Input() updateStatusUrl: string = '';
  @Input() generatePdfUrl: string = '';
  @Input() namePdf: string = '';
  @Input() generateReportParam: any = {};
  @Input() updatePrintStatusParam: any = {};
  @Input() isFullWidth: boolean = false;
  @Input() typePrint: string = 'print'; // default, deliveryOrder, purchaseOrder, etc.
  @Output() reloadTable = new EventEmitter<void>();

  protected config = AppConfig.settings.apiServer;

  updatingStatus: boolean = false;

  constructor(
    private dataService: DataService,
    private toastr: ToastrService,
    private g: GlobalService
  ) { }

  async onClick() {
    this.updatingStatus = true;
    try {
      if (this.updateStatusUrl !== '' || this.updatePrintStatusParam !== '') {
        await lastValueFrom(
          this.dataService.postData(this.config.BASE_URL + this.updateStatusUrl, this.updatePrintStatusParam)
        );
      }

      try {
        console.log('generateReportParam', this.generateReportParam);
        const base64Response = await lastValueFrom(
          this.dataService.postData(this.config.BASE_URL + this.generatePdfUrl, this.generateReportParam, true)
        );
        const blob = new Blob([base64Response as BlobPart], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-'); // "2025-04-16T12-34-56-789Z"
        const fileName = `${this.namePdf || 'report'}_${timestamp}.pdf`;

        if (this.typePrint === 'download') {
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }else{
          window.open(url);
        }
       
      } catch (error: any) {
        this.toastr.error(error.message ?? 'Unknown error while generating PDF');
      }
    } catch (error: any) {
      this.toastr.error(error.message ?? 'Error updating status');
    } finally {
      this.updatingStatus = false;
      this.reloadTable.emit();
    }
  }
}
