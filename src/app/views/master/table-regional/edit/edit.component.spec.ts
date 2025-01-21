import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRegionalEditComponent } from './edit.component';

describe('TableRegionalEditComponent', () => {
  let component: TableRegionalEditComponent;
  let fixture: ComponentFixture<TableRegionalEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRegionalEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRegionalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
