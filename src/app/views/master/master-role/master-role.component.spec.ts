import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterRoleComponent } from './master-role.component';

describe('MasterRoleComponent', () => {
  let component: MasterRoleComponent;
  let fixture: ComponentFixture<MasterRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterRoleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
