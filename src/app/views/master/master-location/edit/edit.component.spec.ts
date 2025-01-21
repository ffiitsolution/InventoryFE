import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterLocationEditComponent } from './edit.component';

describe('MasterLocationEditComponent', () => {
  let component: MasterLocationEditComponent;
  let fixture: ComponentFixture<MasterLocationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterLocationEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterLocationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
