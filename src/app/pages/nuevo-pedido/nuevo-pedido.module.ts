import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NuevoPedidoRoutingModule } from './nuevo-pedido-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { PedidosComponent } from './pedidos/pedidos.component';

@NgModule({
  declarations: [PedidosComponent],
  imports: [
    CommonModule,
    NuevoPedidoRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
})
export class NuevoPedidoModule {}
