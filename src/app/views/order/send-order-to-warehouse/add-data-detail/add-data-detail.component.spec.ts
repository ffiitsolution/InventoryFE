import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDataDetailSendOrderToWarehouseComponent } from './add-data-detail.component';

describe('AddDataDetailSendOrderToWarehouseComponent', () => {
  let component: AddDataDetailSendOrderToWarehouseComponent;
  let fixture: ComponentFixture<AddDataDetailSendOrderToWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDataDetailSendOrderToWarehouseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDataDetailSendOrderToWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
