import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterRoleAddComponent } from './add.component';

describe('MasterRoleAddComponent', () => {
  let component: MasterRoleAddComponent;
  let fixture: ComponentFixture<MasterRoleAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterRoleAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterRoleAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
