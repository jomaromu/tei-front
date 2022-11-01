import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MiBandejaComponent } from './mi-bandeja.component';

const routes: Routes = [
  {
    path: '',
    // canActivate: [NoPermitidoGuard],
    component: MiBandejaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MiBandejaRoutingModule {}
