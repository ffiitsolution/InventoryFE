import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterLocationAddComponent } from './add.component';

describe('MasterLocationAddComponent', () => {
  let component: MasterLocationAddComponent;
  let fixture: ComponentFixture<MasterLocationAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterLocationAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterLocationAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
