import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { MiBandejaRoutingModule } from './mi-bandeja-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';

import { MiBandejaComponent } from './mi-bandeja.component';
import { ModalNuevoPedidoComponent } from './shared/modal-nuevo-pedido/modal-nuevo-pedido.component';
import { CrearEditarClienteComponent } from './shared/crear-editar-cliente/crear-editar-cliente.component';

// providers
import { Validaciones } from '../../../classes/validaciones';
import { OrdenarPedidos } from '../../../classes/ordenar-pedidos';

// PRIMENG
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';

@NgModule({
  declarations: [
    MiBandejaComponent,
    ModalNuevoPedidoComponent,
    CrearEditarClienteComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MiBandejaRoutingModule,
    SharedModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    TabViewModule,
    CalendarModule,
    CheckboxModule,
    SkeletonModule,
    LoadingModule,
    LayoutModule,
  ],
  providers: [Validaciones, OrdenarPedidos],
})
export class MiBandejaModule {}
