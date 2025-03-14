import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingPoSupplierAddDetailFormComponent } from './add-detail-form.component';

describe('ReceivingPoSupplierAddDetailFormComponent', () => {
  let component: ReceivingPoSupplierAddDetailFormComponent;
  let fixture: ComponentFixture<ReceivingPoSupplierAddDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingPoSupplierAddDetailFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivingPoSupplierAddDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
