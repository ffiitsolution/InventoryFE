import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePositionAddComponent } from './add.component';

describe('TablePositionAddComponent', () => {
  let component: TablePositionAddComponent;
  let fixture: ComponentFixture<TablePositionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePositionAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablePositionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
