import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoPermitidoComponent } from './no-permitido/no-permitido.component';

const routes: Routes = [
  {
    path: '',
    component: NoPermitidoComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoPermitidoRouteModule {}
