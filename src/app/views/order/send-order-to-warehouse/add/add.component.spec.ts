import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendOrderToWarehouseAddComponent } from './add.component';

describe('SendOrderToWarehouseAddComponent', () => {
  let component: SendOrderToWarehouseAddComponent;
  let fixture: ComponentFixture<SendOrderToWarehouseAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendOrderToWarehouseAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SendOrderToWarehouseAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
