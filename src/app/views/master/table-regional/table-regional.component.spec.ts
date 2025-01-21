import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRegionalComponent } from './table-regional.component';

describe('TableRegionalComponent', () => {
  let component: TableRegionalComponent;
  let fixture: ComponentFixture<TableRegionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRegionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableRegionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
