import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterSupplierDetailComponent } from './detail.component';

describe('MasterSupplierDetailComponent', () => {
  let component: MasterSupplierDetailComponent;
  let fixture: ComponentFixture<MasterSupplierDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterSupplierDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterSupplierDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
