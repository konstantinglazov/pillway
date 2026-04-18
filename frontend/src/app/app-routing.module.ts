import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/transfer', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'transfer',
    loadChildren: () => import('./features/transfer/transfer.module').then(m => m.TransferModule),
    canActivate: [authGuard],
  },
  {
    path: 'confirmation',
    loadChildren: () => import('./features/confirmation/confirmation.module').then(m => m.ConfirmationModule),
  },
  { path: '**', redirectTo: '/transfer' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
