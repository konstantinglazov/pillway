import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TransferComponent } from './transfer.component';
import { StepIntroComponent } from './steps/step-intro/step-intro.component';
import { StepPharmacyComponent } from './steps/step-pharmacy/step-pharmacy.component';
import { StepPharmacyConfirmComponent } from './steps/step-pharmacy-confirm/step-pharmacy-confirm.component';
import { StepMedicationComponent } from './steps/step-preferences/step-preferences.component';
import { StepReviewComponent } from './steps/step-review/step-review.component';
import { StepSelectProfileComponent } from './steps/step-select-profile/step-select-profile.component';
import { TransferFormService } from './transfer-form.service';

const routes: Routes = [
  {
    path: '',
    component: TransferComponent,
    children: [
      { path: '',               redirectTo: 'intro', pathMatch: 'full' },
      { path: 'intro',          component: StepIntroComponent },
      { path: 'select-profile', component: StepSelectProfileComponent },
      { path: 'pharmacy',       component: StepPharmacyComponent },
      { path: 'confirm',        component: StepPharmacyConfirmComponent },
      { path: 'medication',     component: StepMedicationComponent },
      { path: 'review',         component: StepReviewComponent },
    ],
  },
];

@NgModule({
  declarations: [
    TransferComponent,
    StepIntroComponent,
    StepSelectProfileComponent,
    StepPharmacyComponent,
    StepPharmacyConfirmComponent,
    StepMedicationComponent,
    StepReviewComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    TransferFormService,
  ],
})
export class TransferModule {}
