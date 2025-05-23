import {
  AfterViewInit,
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
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';

@Component({
  selector: 'app-index-app-info',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class AllAppInfoComponent implements OnInit, OnDestroy, AfterViewInit {
  data: any;
  public panes = [
    { name: 'About Software', content: 'app-info/about-software' },
    { name: 'Release Notes', content: 'app-info/release-notes' },
    { name: 'Module', content: 'app-info/modules' },
    // { name: 'Company Profile', content: 'app-company-profile' },
    // { name: 'Utility', content: 'app-info-utility' },
  ];

  activePane: number = 0;
  listDataTemplate: any[] = [];

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('About') +
        ' ' +
        this.translation.instant('Software') +
        ' - ' +
        this.g.tabTitle
    );
  }

  ngOnDestroy(): void {}

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {}

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  onTabChange(tabId: any) {
    if (tabId === 0) {
      this.g.changeTitle(
        this.translation.instant('About') +
          ' ' +
          this.translation.instant('Software') +
          ' - ' +
          this.g.tabTitle
      );
    } else if (tabId === 1) {
      this.g.changeTitle(
        this.translation.instant('Release') +
          ' ' +
          this.translation.instant('Note') +
          ' - ' +
          this.g.tabTitle
      );
    } else if (tabId === 2) {
      this.g.changeTitle(
        this.translation.instant('Modules') + ' - ' + this.g.tabTitle
      );
    }
  }
}
