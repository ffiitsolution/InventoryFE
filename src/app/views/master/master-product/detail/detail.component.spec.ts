import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterProductDetailComponent } from './detail.component';

describe('MasterProductDetailComponent', () => {
  let component: MasterProductDetailComponent;
  let fixture: ComponentFixture<MasterProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterProductDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
