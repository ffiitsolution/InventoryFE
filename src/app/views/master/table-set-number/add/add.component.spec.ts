import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSetNumberAddComponent } from './add.component';

describe('TableSetNumberAddComponent', () => {
  let component: TableSetNumberAddComponent;
  let fixture: ComponentFixture<TableSetNumberAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSetNumberAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableSetNumberAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
