import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDataDetailBarangComponent } from './add-detail.component';

describe('AddDataDetailBarangComponent', () => {
  let component: AddDataDetailBarangComponent;
  let fixture: ComponentFixture<AddDataDetailBarangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDataDetailBarangComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDataDetailBarangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
