import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingPoSupplierDetailComponent } from './detail.component';

describe('ReceivingPoSupplierDetailComponent', () => {
  let component: ReceivingPoSupplierDetailComponent;
  let fixture: ComponentFixture<ReceivingPoSupplierDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingPoSupplierDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivingPoSupplierDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
