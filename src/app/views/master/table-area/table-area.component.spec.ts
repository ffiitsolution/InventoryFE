import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAreaComponent } from './table-area.component';

describe('TableAreaComponent', () => {
  let component: TableAreaComponent;
  let fixture: ComponentFixture<TableAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
