import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterBranchComponent } from './master-branch.component';

describe('MasterBranchComponent', () => {
  let component: MasterBranchComponent;
  let fixture: ComponentFixture<MasterBranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterBranchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
