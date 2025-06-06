import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_RECEIVING_ORDER,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent
  implements OnInit {

  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
  }

  listCounter (destination: string) {
    if(destination === 'receivingGudang') {
      this.router.navigate(['/order/receiving-order']);
    }
    if(destination === 'receivingSupplier') {
      this.router.navigate(['/order/receiving-po-supplier']);
    }
    if(destination === 'sendGudang') {
      this.router.navigate(['/order/send-order-to-warehouse']);
    }
    if(destination === 'sendSupplier') {
      this.router.navigate(['/order/send-order-to-supplier-via-rsc']);
    }
  }

}
