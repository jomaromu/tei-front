import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// COMPONENTESAS
import { SidebarComponent } from './sidebar/sidebar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TablesCatalogosComponent } from './tables-catalogos/tables-catalogos.component';
import { LoadingComponent } from './loading/loading.component';
import { TablaPedidosComponent } from './tabla-pedidos/tabla-pedidos.component';
import { TablaReportesComponent } from './tabla-reportes/tabla-reportes.component';

import { EditarClienteComponent } from './editar-cliente/editar-cliente.component';

// PRIMENG
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuComponent } from './menu/menu/menu.component';

@NgModule({
  declarations: [
    SidebarComponent,
    NotFoundComponent,
    TablesCatalogosComponent,
    LoadingComponent,
    TablaPedidosComponent,
    TablaReportesComponent,

    EditarClienteComponent,
    MenuComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
  ],
  exports: [
    SidebarComponent,
    TablesCatalogosComponent,
    LoadingComponent,
    TablaPedidosComponent,
    TablaReportesComponent,

    EditarClienteComponent,
    MenuComponent,
  ],
})
export class SharedModule {}
