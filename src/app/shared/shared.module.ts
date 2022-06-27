import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// COMPONENTESAS
import { SidebarComponent } from './sidebar/sidebar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BusquedaComponent } from './busqueda/busqueda.component';
import { TablesCatalogosComponent } from './tables-catalogos/tables-catalogos.component';
import { LoadingComponent } from './loading/loading.component';
import { TablaPedidosComponent } from './tabla-pedidos/tabla-pedidos.component';
import { ModalDataComponent } from './modal-data/modal-data.component';
import { TablaReportesComponent } from './tabla-reportes/tabla-reportes.component';

// PIES
import { TotalReportesPipe } from '../pipes/total-reportes.pipe';
import { EditarClienteComponent } from './editar-cliente/editar-cliente.component';

@NgModule({
  declarations: [
    SidebarComponent,
    NotFoundComponent,
    BusquedaComponent,
    TablesCatalogosComponent,
    LoadingComponent,
    TablaPedidosComponent,
    ModalDataComponent,
    TablaReportesComponent,
    TotalReportesPipe,
    EditarClienteComponent,
  ],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [
    SidebarComponent,
    BusquedaComponent,
    TablesCatalogosComponent,
    LoadingComponent,
    TablaPedidosComponent,
    ModalDataComponent,
    TablaReportesComponent,
    TotalReportesPipe,
    EditarClienteComponent,
  ],
})
export class SharedModule {}
