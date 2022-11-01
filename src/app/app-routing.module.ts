import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// guards
import { LoginGuard } from './guards/login.guard';
import { DashboardGuard } from './guards/dashboard.guard';
import { PermitidoGuard } from './guards/permitido.guard';
import { NotfoundGuard } from './guards/notfound.guard';
import { NotFoundComponent } from './shared/not-found/not-found.component';


const routes: Routes = [
  {
    path: 'login',
    // component: LoginComponent,
    canActivate: [LoginGuard],
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'dashboard',
    canActivate: [DashboardGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: 'no-permitido',
    canActivate: [PermitidoGuard],
    loadChildren: () =>
      import('./pages/no-permitido/no-permitido.module').then(
        (m) => m.NoPermitidoModule
      ),
  },
  {
    path: 'recuperar-password',
    canActivate: [NotfoundGuard],
    loadChildren: () =>
      import('./pages/recuperar-pass/recuperar-pass.module').then(
        (m) => m.RecuperarPassModule
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
