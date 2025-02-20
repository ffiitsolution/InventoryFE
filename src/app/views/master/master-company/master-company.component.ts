import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';

@Component({
  selector: 'app-master-company',
  templateUrl: 'master-company.component.html',
  styleUrl: 'master-company.component.scss',
})
export class MasterCompanyComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  page = new Page();
  data: any;
  loadingIndicator = true;
  orders: any[] = [];
  selectedRowData: any;
  isFilterShown: boolean = false;
  selectedStatusFilter: any = '';

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Master') +
        ' ' +
        this.translation.instant('Perusahaan') +
        ' - ' +
        this.g.tabTitle
    );
  }

  actionBtnClick(action: string) {
    let data = this.selectedRowData;
    this.g.alertConfirm(action, JSON.stringify(data)).then((result) => {
      //
    });
    if (action === 'edit') {
    }
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {}
}
