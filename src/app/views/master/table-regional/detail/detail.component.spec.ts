import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRegionalDetailComponent } from './detail.component';

describe('TableRegionalDetailComponent', () => {
  let component: TableRegionalDetailComponent;
  let fixture: ComponentFixture<TableRegionalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRegionalDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRegionalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
