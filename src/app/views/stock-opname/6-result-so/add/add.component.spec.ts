import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUomAddComponent } from './add.component';

describe('TableUomAddComponent', () => {
  let component: TableUomAddComponent;
  let fixture: ComponentFixture<TableUomAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUomAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableUomAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
