import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { GlobalService } from 'src/app/service/global.service';

@Component({
  templateUrl: 'end-of-month.component.html',
  styleUrls: ['end-of-month.component.scss'],
})
export class EndOfMonthComponent implements OnInit {
  constructor(private g: GlobalService) {}
  currentView: string = 'closing';
  rangeBulan: any[] = [];
  rangeTahun: any[] = [];

  ngOnInit(): void {
    this.rangeBulan = this.g.generateNumberRange(1, 12);
    this.rangeTahun = this.g.generateNumberRange(2025, 2100);
  }

  setCurrentView(view:string){
    this.currentView = view;
  }
}
