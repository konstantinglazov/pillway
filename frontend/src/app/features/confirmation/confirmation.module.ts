import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmationComponent } from './confirmation.component';

const routes: Routes = [{ path: '', component: ConfirmationComponent }];

@NgModule({
  declarations: [ConfirmationComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ConfirmationModule {}
