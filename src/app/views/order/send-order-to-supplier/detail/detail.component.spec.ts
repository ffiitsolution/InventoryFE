import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSendOrderToSupplierComponent } from './detail.component';

describe('DetailSendOrderToSupplierComponent', () => {
  let component: DetailSendOrderToSupplierComponent;
  let fixture: ComponentFixture<DetailSendOrderToSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSendOrderToSupplierComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailSendOrderToSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
