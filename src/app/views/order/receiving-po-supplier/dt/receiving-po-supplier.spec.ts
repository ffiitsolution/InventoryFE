import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingPoSupplierComponent } from './receiving-po-supplier.component';

describe('ReceivingPoSupplierComponent', () => {
  let component: ReceivingPoSupplierComponent;
  let fixture: ComponentFixture<ReceivingPoSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingPoSupplierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceivingPoSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
