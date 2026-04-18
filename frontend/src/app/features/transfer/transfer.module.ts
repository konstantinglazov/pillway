import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TransferComponent } from './transfer.component';
import { StepPreferencesComponent } from './steps/step-preferences/step-preferences.component';
import { StepLocationComponent } from './steps/step-location/step-location.component';
import { StepReviewComponent } from './steps/step-review/step-review.component';
import { TransferFormService } from './transfer-form.service';

const routes: Routes = [
  {
    path: '',
    component: TransferComponent,
    children: [
      { path: '', redirectTo: 'preferences', pathMatch: 'full' },
      { path: 'preferences', component: StepPreferencesComponent },
      { path: 'location', component: StepLocationComponent },
      { path: 'review', component: StepReviewComponent },
    ],
  },
];

@NgModule({
  declarations: [
    TransferComponent,
    StepPreferencesComponent,
    StepLocationComponent,
    StepReviewComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    // TransferFormService is scoped to TransferModule so it is created once
    // for the lifetime of the transfer flow and destroyed on exit.
    TransferFormService,
  ],
})
export class TransferModule {}
