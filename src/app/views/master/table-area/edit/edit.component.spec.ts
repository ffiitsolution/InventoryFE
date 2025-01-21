import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAreaEditComponent } from './edit.component';

describe('TableAreaEditComponent', () => {
  let component: TableAreaEditComponent;
  let fixture: ComponentFixture<TableAreaEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableAreaEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableAreaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
