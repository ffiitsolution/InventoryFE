import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRuteComponent } from './table-rute.component';

describe('TableRuteComponent', () => {
  let component: TableRuteComponent;
  let fixture: ComponentFixture<TableRuteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRuteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableRuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
