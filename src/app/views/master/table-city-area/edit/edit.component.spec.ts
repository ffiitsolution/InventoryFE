import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCityAreaEditComponent } from './edit.component';

describe('TableCityAreaEditComponent', () => {
  let component: TableCityAreaEditComponent;
  let fixture: ComponentFixture<TableCityAreaEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCityAreaEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableCityAreaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
