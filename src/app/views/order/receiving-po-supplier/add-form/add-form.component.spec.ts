import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingPoSupplierAddFormComponent } from './add-form.component';

describe('ReceivingPoSupplierAddFormComponent', () => {
  let component: ReceivingPoSupplierAddFormComponent;
  let fixture: ComponentFixture<ReceivingPoSupplierAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingPoSupplierAddFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivingPoSupplierAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
