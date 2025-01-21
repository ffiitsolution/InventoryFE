import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterLocationDetailComponent } from './detail.component';

describe('MasterLocationDetailComponent', () => {
  let component: MasterLocationDetailComponent;
  let fixture: ComponentFixture<MasterLocationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterLocationDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterLocationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
