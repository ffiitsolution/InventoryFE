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
  selector: 'app-return-order',
  templateUrl: './return-order.component.html',
  styleUrl: './return-order.component.scss',
})
export class ReturnOrderComponent
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
    if(destination === 'receivingReturSite') {
      this.router.navigate(['/transaction/terima-barang-retur-dari-site/list-dt']);
    }
    if(destination === 'sendReturSite') {
      this.router.navigate(['/transaction/kirim-barang-return-ke-site/list-dt']);
    }
    if(destination === 'sendReturSupplier') {
      this.router.navigate(['/transaction/retur-ke-supplier/list-barang-retur']);
    }
  }

}
