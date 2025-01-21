import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAreaAddComponent } from './add.component';

describe('TableAreaAddComponent', () => {
  let component: TableAreaAddComponent;
  let fixture: ComponentFixture<TableAreaAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableAreaAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableAreaAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
