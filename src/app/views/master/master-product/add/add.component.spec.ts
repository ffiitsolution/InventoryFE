import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterProductAddComponent } from './add.component';

describe('MasterProductAddComponent', () => {
  let component: MasterProductAddComponent;
  let fixture: ComponentFixture<MasterProductAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterProductAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterProductAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
