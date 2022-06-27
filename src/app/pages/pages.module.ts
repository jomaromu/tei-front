import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoutingPagesModule } from './routing-pages.module';
import { RouterModule } from '@angular/router';


// Componentes
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { SharedModule } from '../shared/shared.module';
import { MiBandejaComponent } from './mi-bandeja/mi-bandeja.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { FacturacionComponent } from './facturacion/facturacion.component';
import { ReportesComponent } from './reportes/reportes.component';
import { AyudaComponent } from './ayuda/ayuda.component';
import { BitacoraComponent } from './bitacora/bitacora.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProductosComponent } from './productos/productos.component';
import { OrigenPedidoComponent } from './origen-pedido/origen-pedido.component';
import { ArchivosPedidoComponent } from './archivos-pedido/archivos-pedido.component';
import { MetodosPagoComponent } from './metodos-pago/metodos-pago.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { PedidoComponent } from './pedido/pedido.component';

// pipes
import { EnlacesPipe } from '../pipes/enlaces.pipe';
import { NombreArchivoPipe } from '../pipes/nombre-archivo.pipe';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminComponent,
    MiBandejaComponent,
    PedidosComponent,
    FacturacionComponent,
    ReportesComponent,
    AyudaComponent,
    BitacoraComponent,
    SucursalesComponent,
    UsuariosComponent,
    ClientesComponent,
    ProductosComponent,
    OrigenPedidoComponent,
    ArchivosPedidoComponent,
    MetodosPagoComponent,
    CategoriasComponent,
    PedidoComponent,
    EnlacesPipe,
    NombreArchivoPipe],
  imports: [
    CommonModule,
    RoutingPagesModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    DatePipe
  ]
})
export class PagesModule { }
