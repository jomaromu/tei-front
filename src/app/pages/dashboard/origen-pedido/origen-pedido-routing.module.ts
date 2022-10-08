import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrigenPedidoComponent } from './origen-pedido.component';

const routes: Routes = [
  {
    path: '',
    component: OrigenPedidoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrigenPedidoRoutingModule {}
