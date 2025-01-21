import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterSupplierAddComponent } from './add.component';

describe('MasterSupplierAddComponent', () => {
  let component: MasterSupplierAddComponent;
  let fixture: ComponentFixture<MasterSupplierAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterSupplierAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterSupplierAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
