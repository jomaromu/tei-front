import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

// Componentes
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardGuard } from '../guards/dashboard.guard';
import { NotFoundComponent } from '../shared/not-found/not-found.component';
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

const pagesRoutes: Routes = [
  {
    path: 'dashboard',
    canActivate: [DashboardGuard],
    component: DashboardComponent,
    children: [
      // { path: 'admin', component: AdminComponent },
      { path: 'admin', component: MiBandejaComponent },
      { path: 'mi-bandeja', component: MiBandejaComponent },
      { path: 'nuevo-pedido', component: PedidosComponent },
      { path: 'pedido', component: PedidoComponent },
      { path: 'facturacion', component: FacturacionComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'ayuda', component: AyudaComponent },
      { path: 'bitacora', component: BitacoraComponent },
      { path: 'sucursales', component: SucursalesComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'origen-pedido', component: OrigenPedidoComponent },
      { path: 'archivos-pedido', component: ArchivosPedidoComponent },
      { path: 'metodos-pagos', component: MetodosPagoComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(pagesRoutes)],
})
export class RoutingPagesModule {}
