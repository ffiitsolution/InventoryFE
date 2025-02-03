import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingOrderDetailComponent } from './detail.component';

describe('ReceivingOrderDetailComponent', () => {
  let component: ReceivingOrderDetailComponent;
  let fixture: ComponentFixture<ReceivingOrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingOrderDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivingOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
