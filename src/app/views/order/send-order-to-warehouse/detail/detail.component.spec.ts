import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSendOrderToWarehouseComponent } from './detail.component';

describe('DetailSendOrderToWarehouseComponent', () => {
  let component: DetailSendOrderToWarehouseComponent;
  let fixture: ComponentFixture<DetailSendOrderToWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSendOrderToWarehouseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailSendOrderToWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
