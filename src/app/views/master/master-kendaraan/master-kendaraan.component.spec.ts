import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterKendaraanComponent } from './master-kendaraan.component';

describe('MasterKendaraanComponent', () => {
  let component: MasterKendaraanComponent;
  let fixture: ComponentFixture<MasterKendaraanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterKendaraanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterKendaraanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
