import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUomDetailComponent } from './detail.component';

describe('TableUomDetailComponent', () => {
  let component: TableUomDetailComponent;
  let fixture: ComponentFixture<TableUomDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUomDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableUomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
