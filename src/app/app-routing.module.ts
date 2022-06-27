import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { LoginComponent } from './pages/login/login.component';

// guards
import { LoginGuard } from './guards/login.guard';
import { DashboardGuard } from './guards/dashboard.guard';

const routes: Routes = [
  // { path: 'dashboard', canActivate: [DashboardGuard], component: DashboardComponent },
  { path: 'login', canActivate: [LoginGuard], component: LoginComponent },
  { path: 'dashboard', redirectTo: 'dashboard/admin', pathMatch: 'full' },
  { path: '', redirectTo: 'dashboard/admin', pathMatch: 'full' },
  // { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
