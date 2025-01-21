import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSetNumberComponent } from './table-set-number.component';

describe('TableSetNumberComponent', () => {
  let component: TableSetNumberComponent;
  let fixture: ComponentFixture<TableSetNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSetNumberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableSetNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
