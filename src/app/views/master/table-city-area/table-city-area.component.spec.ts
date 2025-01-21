import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCityAreaComponent } from './table-city-area.component';

describe('TableCityAreaComponent', () => {
  let component: TableCityAreaComponent;
  let fixture: ComponentFixture<TableCityAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCityAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableCityAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
