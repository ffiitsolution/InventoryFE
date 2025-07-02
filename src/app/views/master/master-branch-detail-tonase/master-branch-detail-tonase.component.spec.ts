import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterBranchDetailTonaseComponent } from './master-branch-detail-tonase.component';

describe('MasterBranchDetailTonaseComponent', () => {
  let component: MasterBranchDetailTonaseComponent;
  let fixture: ComponentFixture<MasterBranchDetailTonaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterBranchDetailTonaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterBranchDetailTonaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
