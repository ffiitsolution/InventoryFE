import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUomComponent } from './table-uom.component';

describe('TableUomComponent', () => {
  let component: TableUomComponent;
  let fixture: ComponentFixture<TableUomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableUomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
