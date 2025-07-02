import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDriverComponent } from './master-driver.component';

describe('MasterDriverComponent', () => {
  let component: MasterDriverComponent;
  let fixture: ComponentFixture<MasterDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterDriverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
