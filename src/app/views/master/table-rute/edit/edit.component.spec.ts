import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRuteEditComponent } from './edit.component';

describe('TableRuteEditComponent', () => {
  let component: TableRuteEditComponent;
  let fixture: ComponentFixture<TableRuteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRuteEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRuteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
