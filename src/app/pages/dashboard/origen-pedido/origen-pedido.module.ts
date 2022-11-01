import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modulos
import { OrigenPedidoRoutingModule } from './origen-pedido-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';


import { OrigenPedidoComponent } from './origen-pedido.component';

// PRIMENG
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';

// providers
import { Validaciones } from '../../../classes/validaciones';

@NgModule({
  declarations: [OrigenPedidoComponent],
  imports: [
    CommonModule,
    OrigenPedidoRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    LoadingModule
  ],
  providers: [Validaciones],
})
export class OrigenPedidoModule {}
