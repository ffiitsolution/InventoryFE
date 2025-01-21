import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCityAreaAddComponent } from './add.component';

describe('TableCityAreaAddComponent', () => {
  let component: TableCityAreaAddComponent;
  let fixture: ComponentFixture<TableCityAreaAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCityAreaAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableCityAreaAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
