import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRuteAddComponent } from './add.component';

describe('TableRuteAddComponent', () => {
  let component: TableRuteAddComponent;
  let fixture: ComponentFixture<TableRuteAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRuteAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRuteAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
