import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterSupplierComponent } from './master-supplier.component';

describe('MasterSupplierComponent', () => {
  let component: MasterSupplierComponent;
  let fixture: ComponentFixture<MasterSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterSupplierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
