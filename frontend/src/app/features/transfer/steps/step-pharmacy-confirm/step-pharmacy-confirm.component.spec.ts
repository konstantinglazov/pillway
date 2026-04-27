import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StepPharmacyConfirmComponent } from './step-pharmacy-confirm.component';
import { TransferFormService } from '../../transfer-form.service';
import { AuthService } from '../../../../core/services/auth.service';

describe('StepPharmacyConfirmComponent', () => {
  let component: StepPharmacyConfirmComponent;
  let fixture: ComponentFixture<StepPharmacyConfirmComponent>;
  let formService: TransferFormService;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy   = jasmine.createSpyObj('AuthService', ['getUserInfo', 'getUserInitials']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authSpy.getUserInfo.and.returnValue({ fullName: 'Jane Smith', email: 'jane@example.com' });
    authSpy.getUserInitials.and.returnValue('JS');

    await TestBed.configureTestingModule({
      declarations: [StepPharmacyConfirmComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        TransferFormService,
        { provide: AuthService, useValue: authSpy   },
        { provide: Router,      useValue: routerSpy },
      ],
    }).compileComponents();

    fixture     = TestBed.createComponent(StepPharmacyConfirmComponent);
    component   = fixture.componentInstance;
    formService = TestBed.inject(TransferFormService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('sourcePharmacy getter', () => {
    it('reflects the sourcePharmacyGroup form value', () => {
      formService.sourcePharmacyGroup.patchValue({
        name: 'Shoppers Drug Mart',
        formatted_address: '100 King St W, Toronto, ON',
        lat: 43.65, lng: -79.38, place_id: 'place_abc',
      });
      expect(component.sourcePharmacy.name).toBe('Shoppers Drug Mart');
      expect(component.sourcePharmacy.formatted_address).toBe('100 King St W, Toronto, ON');
    });

    it('returns empty strings when pharmacy is not yet selected', () => {
      expect(component.sourcePharmacy.name).toBe('');
    });
  });

  describe('profile getters', () => {
    it('fullName comes from AuthService', () => {
      expect(component.fullName).toBe('Jane Smith');
    });

    it('initials comes from AuthService', () => {
      expect(component.initials).toBe('JS');
    });

    it('fullName falls back to "User" when getUserInfo() returns null', () => {
      authSpy.getUserInfo.and.returnValue(null);
      expect(component.fullName).toBe('User');
    });
  });

  describe('navigation', () => {
    it('onBack() navigates to /transfer/pharmacy', () => {
      component.onBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/pharmacy']);
    });

    it('onContinue() navigates to /transfer/medication', () => {
      component.onContinue();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/medication']);
    });
  });
});
