import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { DataService } from '../../service/data.service';
import { GlobalService } from '../../service/global.service';
import { AppConfig } from '../../config/app.config';

@Component({
  selector: 'app-modal-print-list',
  templateUrl: './modal-print-list.component.html',
  styleUrls: ['./modal-print-list.component.scss']
})
export class ModalPrintListComponent {
  @Input() alreadyPrint: boolean = false;
  @Input() rejectingOrder: boolean = false;
  @Input() disabledPrintButton: boolean = false;
  @Input() updateStatusUrl: string = '';
  @Input() generatePdfUrl: string = '';
  @Input() generateReportParam: any = {};
  @Input() namePdf: string = '';
  @Input() updatePrintStatusParam: any = {};
  @Input() isShowModalReport: boolean = false; 
  @Input() isShowSelection: boolean = false;// default, deliveryOrder, purchaseOrder, etc.
  @Output() reloadTable = new EventEmitter<void>();
  @Output() closeModalEvent = new EventEmitter<void>();

  protected config = AppConfig.settings.apiServer;
  confirmSelection: string = 'Ya';

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

        if(this.isShowSelection) this.generateReportParam.confirmSelection = this.confirmSelection;
        const base64Response = await lastValueFrom(
          this.dataService.postData(this.config.BASE_URL + this.generatePdfUrl, this.generateReportParam, true)
        );
        const blob = new Blob([base64Response as BlobPart], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
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

  closeModal() {
    this.closeModalEvent.emit();
  }
}
