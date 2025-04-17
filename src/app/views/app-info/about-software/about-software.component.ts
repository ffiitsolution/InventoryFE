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
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-about-software-app-info',
  templateUrl: './about-software.component.html',
  styleUrl: './about-software.component.scss',
})
export class AboutSoftwareComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  data: any;
  loadingIndicator = true;

  selectedVersionIndex: number = 0;
  version: string = environment.VERSION;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
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
}
