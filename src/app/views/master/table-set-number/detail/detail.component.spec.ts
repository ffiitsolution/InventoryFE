import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSetNumberDetailComponent } from './detail.component';

describe('TableSetNumberDetailComponent', () => {
  let component: TableSetNumberDetailComponent;
  let fixture: ComponentFixture<TableSetNumberDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSetNumberDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableSetNumberDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
