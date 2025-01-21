import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterSupplierEditComponent } from './edit.component';

describe('MasterSupplierEditComponent', () => {
  let component: MasterSupplierEditComponent;
  let fixture: ComponentFixture<MasterSupplierEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterSupplierEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterSupplierEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
