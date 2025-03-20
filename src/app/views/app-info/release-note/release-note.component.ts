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
import { releaseNotes } from './release-notes';

@Component({
  selector: 'app-release-note-app-info',
  templateUrl: './release-note.component.html',
  styleUrl: './release-note.component.scss',
})
export class ReleaseNoteComponent implements OnInit, OnDestroy, AfterViewInit {
  data: any;
  loadingIndicator = true;

  selectedVersionIndex: number = 0;
  releaseNotes: ReleaseNote[] = releaseNotes;
  selectedRelease: ReleaseNote;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Release') +
        ' ' +
        this.translation.instant('Notes') +
        ' - ' +
        this.g.tabTitle
    );
    this.selectedRelease = this.releaseNotes[0];
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

  selectVersion(index: number): void {
    // console.log('index: ', index);
    this.selectedVersionIndex = index;
    this.selectedRelease = this.releaseNotes[index];
  }
}

interface ReleaseNote {
  version: string;
  date: string;
  changelog: {
    features: string[];
    bug_fixs: string[];
    improvements: string[];
    security_updates: string[];
  };
}
