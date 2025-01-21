import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterUserDetailComponent } from './detail.component';

describe('MasterUserDetailComponent', () => {
  let component: MasterUserDetailComponent;
  let fixture: ComponentFixture<MasterUserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterUserDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterUserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
