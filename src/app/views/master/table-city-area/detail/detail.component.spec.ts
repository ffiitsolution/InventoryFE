import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCityAreaDetailComponent } from './detail.component';

describe('TableCityAreaDetailComponent', () => {
  let component: TableCityAreaDetailComponent;
  let fixture: ComponentFixture<TableCityAreaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCityAreaDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableCityAreaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
