import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUomEditComponent } from './edit.component';

describe('TableUomEditComponent', () => {
  let component: TableUomEditComponent;
  let fixture: ComponentFixture<TableUomEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUomEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableUomEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
