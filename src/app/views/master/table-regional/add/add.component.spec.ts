import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRegionalAddComponent } from './add.component';

describe('TableRegionalAddComponent', () => {
  let component: TableRegionalAddComponent;
  let fixture: ComponentFixture<TableRegionalAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRegionalAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRegionalAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
