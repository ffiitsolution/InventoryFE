import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRscAddComponent } from './add.component';

describe('TableRscAddComponent', () => {
  let component: TableRscAddComponent;
  let fixture: ComponentFixture<TableRscAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRscAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableRscAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
