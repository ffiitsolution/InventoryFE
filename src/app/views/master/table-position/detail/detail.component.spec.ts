import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePositionDetailComponent } from './detail.component';

describe('TablePostionDetailComponent', () => {
  let component: TablePositionDetailComponent;
  let fixture: ComponentFixture<TablePositionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePositionDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablePositionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
