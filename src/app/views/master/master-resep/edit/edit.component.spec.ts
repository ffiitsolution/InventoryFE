import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterProductEditComponent } from './edit.component';

describe('MasterProductEditComponent', () => {
  let component: MasterProductEditComponent;
  let fixture: ComponentFixture<MasterProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterProductEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
