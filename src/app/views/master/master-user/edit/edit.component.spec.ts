import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSetNumberEditComponent } from './edit.component';

describe('TableSetNumberEditComponent', () => {
  let component: TableSetNumberEditComponent;
  let fixture: ComponentFixture<TableSetNumberEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSetNumberEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableSetNumberEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
