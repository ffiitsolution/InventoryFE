import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingOrderComponent } from './receiving-order.component';

describe('ReceivingOrderComponent', () => {
  let component: ReceivingOrderComponent;
  let fixture: ComponentFixture<ReceivingOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceivingOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
