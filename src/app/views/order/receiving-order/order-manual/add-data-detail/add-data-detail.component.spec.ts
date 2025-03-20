import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDataDetailSendOrderToSupplierComponent } from './add-data-detail.component';

describe('AddDataDetailSendOrderToSupplierComponent', () => {
  let component: AddDataDetailSendOrderToSupplierComponent;
  let fixture: ComponentFixture<AddDataDetailSendOrderToSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDataDetailSendOrderToSupplierComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDataDetailSendOrderToSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
