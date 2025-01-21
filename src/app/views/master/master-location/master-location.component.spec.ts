import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterLocationComponent } from './master-location.component';

describe('MasterLocationComponent', () => {
  let component: MasterLocationComponent;
  let fixture: ComponentFixture<MasterLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
