import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAreaDetailComponent } from './detail.component';

describe('TableAreaDetailComponent', () => {
  let component: TableAreaDetailComponent;
  let fixture: ComponentFixture<TableAreaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableAreaDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableAreaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
