import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailKirimBarangReturnKeSiteComponent } from './detail.component';

describe('DetailKirimBarangReturnKeSiteComponent', () => {
  let component: DetailKirimBarangReturnKeSiteComponent;
  let fixture: ComponentFixture<DetailKirimBarangReturnKeSiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailKirimBarangReturnKeSiteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailKirimBarangReturnKeSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
