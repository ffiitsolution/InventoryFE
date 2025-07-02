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
  selector: 'app-pengiriman',
  templateUrl: './pengiriman.component.html',
  styleUrl: './pengiriman.component.scss',
})
export class PengirimanComponent
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
    if(destination === 'displayPengiriman') {
      this.router.navigate(['/transaction/delivery-item']);
    }
    if(destination === 'prosesDOBalik') {
      this.router.navigate(['/transaction/delivery-item/dobalik']);
    }
    if(destination === 'revisiDO') {
      this.router.navigate(['/transaction/delivery-item/revisi-do']);
    }
    if(destination === 'packingList') {
      this.router.navigate(['/transaction/delivery-item/packing-list']);
    }
  }

}
