import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PengirimanComponent } from './pengiriman.component';

describe('PengirimanComponent', () => {
  let component: PengirimanComponent;
  let fixture: ComponentFixture<PengirimanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PengirimanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PengirimanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
