import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AddDataPemakaianBarangSendiriComponent } from './add-data-pemakaian-barang-sendiri.component';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { of } from 'rxjs';

describe('DeliveryItemAddComponent', () => {
  let component: AddDataPemakaianBarangSendiriComponent;
  let fixture: ComponentFixture<AddDataPemakaianBarangSendiriComponent>;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddDataPemakaianBarangSendiriComponent],
      imports: [
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BsDatepickerModule.forRoot(),
      ],
      providers: [
        DataService,
        GlobalService,
        TranslationService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDataPemakaianBarangSendiriComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form fields', () => {
  //   expect(component.orderNumber).toBe('');
  //   expect(component.deliveryDestinationChange).toBe('');
  //   expect(component.destinationAddress).toBe('');
  //   expect(component.deliveryStatus).toBe('');
  //   expect(component.orderDate).toBe('');
  //   expect(component.deliveryDate).toBe('');
  //   expect(component.expirationDate).toBe('');
    expect(component.keterangan).toBe('');
  //   expect(component.validatedDeliveryDate).toBe('');
  });

  it('should set validatedDeliveryDate to today\'s date on save', () => {
    const today = new Date().toISOString().split('T')[0];
    component.onSaveData();
    expect(component.validatedDeliveryDate).toBe(today);
  });

  it('should call saveDeliveryData on save', () => {
    const saveSpy = spyOn(dataService, 'saveDeliveryData' as keyof DataService).and.returnValue(of({}));
    component.onSaveData();
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should navigate to /transaction on previous pressed', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.onPreviousPressed();
    expect(navigateSpy).toHaveBeenCalledWith(['/transaction']);
  });
});