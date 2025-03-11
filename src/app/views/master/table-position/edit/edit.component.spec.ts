import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePositionEditComponent } from './edit.component';

describe('TablePositionEditComponent', () => {
  let component: TablePositionEditComponent;
  let fixture: ComponentFixture<TablePositionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePositionEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablePositionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
