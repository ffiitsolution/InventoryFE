import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRscDetailComponent } from './detail.component';

describe('TableRscDetailComponent', () => {
  let component: TableRscDetailComponent;
  let fixture: ComponentFixture<TableRscDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRscDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableRscDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
