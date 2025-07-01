import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRuteDetailComponent } from './detail.component';

describe('TableRuteDetailComponent', () => {
  let component: TableRuteDetailComponent;
  let fixture: ComponentFixture<TableRuteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRuteDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRuteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
