import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingOrderAddFormComponent } from './add-form.component';

describe('ReceivingOrderAddFormComponent', () => {
  let component: ReceivingOrderAddFormComponent;
  let fixture: ComponentFixture<ReceivingOrderAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingOrderAddFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivingOrderAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
