import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRscEditComponent } from './edit.component';

describe('TableRscEditComponent', () => {
  let component: TableRscEditComponent;
  let fixture: ComponentFixture<TableRscEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRscEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableRscEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
