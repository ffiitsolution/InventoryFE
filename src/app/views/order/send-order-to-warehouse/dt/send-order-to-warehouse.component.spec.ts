import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendOrderToWarehouseComponent } from './send-order-to-warehouse.component';

describe('SendOrderToWarehouseComponent', () => {
  let component: SendOrderToWarehouseComponent;
  let fixture: ComponentFixture<SendOrderToWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendOrderToWarehouseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendOrderToWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
