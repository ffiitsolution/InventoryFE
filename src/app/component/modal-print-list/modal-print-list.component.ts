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

  closeModal() {
    this.closeModalEvent.emit();
  }
}
