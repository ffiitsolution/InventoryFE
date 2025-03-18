import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRscComponent } from './table-position.component';

describe('TableRscComponent', () => {
  let component: TableRscComponent;
  let fixture: ComponentFixture<TableRscComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRscComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableRscComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
