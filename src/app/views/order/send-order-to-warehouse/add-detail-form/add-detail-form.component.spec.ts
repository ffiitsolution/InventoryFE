import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingOrderAddDetailFormComponent } from './add-detail-form.component';

describe('ReceivingOrderAddDetailFormComponent', () => {
  let component: ReceivingOrderAddDetailFormComponent;
  let fixture: ComponentFixture<ReceivingOrderAddDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingOrderAddDetailFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivingOrderAddDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
