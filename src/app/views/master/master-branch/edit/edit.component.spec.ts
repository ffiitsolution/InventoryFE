import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterUserAddComponent } from './add.component';

describe('MasterUserAddComponent', () => {
  let component: MasterUserAddComponent;
  let fixture: ComponentFixture<MasterUserAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterUserAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterUserAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
