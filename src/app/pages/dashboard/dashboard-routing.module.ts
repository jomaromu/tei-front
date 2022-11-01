import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { MiBandejaComponent } from './mi-bandeja/mi-bandeja.component';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,

    children: [
      {
        path: 'mi-bandeja',
        loadChildren: () =>
          import('./mi-bandeja/mi-bandeja.module').then(
            (m) => m.MiBandejaModule
          ),
      },
      {
        path: 'sucursales',
        loadChildren: () =>
          import('./sucursales/sucursales.module').then(
            (m) => m.SucursalesModule
          ),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./usuarios/usuarios.module').then((m) => m.UsuariosModule),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./clientes/clientes.module').then((m) => m.ClientesModule),
      },
      {
        path: 'metodos-pagos',
        loadChildren: () =>
          import('./metodos-pago/metodos-pago.module').then(
            (m) => m.MetodosPagoModule
          ),
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./categorias/categorias.module').then(
            (m) => m.CategoriasModule
          ),
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('./productos/productos.module').then((m) => m.ProductosModule),
      },
      {
        path: 'origen-pedido',
        loadChildren: () =>
          import('./origen-pedido/origen-pedido.module').then(
            (m) => m.OrigenPedidoModule
          ),
      },
      {
        path: 'pedido',
        loadChildren: () =>
          import('./pedido/pedido.module').then((m) => m.PedidoModule),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./roles/roles.module').then((m) => m.RolesModule),
      },
      {
        path: 'colores',
        loadChildren: () =>
          import('./colores/colores.module').then((m) => m.ColoresModule),
      },
      {
        path: 'prioridad',
        loadChildren: () =>
          import('./prioridad/prioridad.module').then((m) => m.PrioridadModule),
      },
      {
        path: 'etapas',
        loadChildren: () =>
          import('./etapas/etapas.module').then((m) => m.EtapasModule),
      },
      {
        path: 'modalidad-pagos',
        loadChildren: () =>
          import('./modalidad/modalidad.module').then((m) => m.ModalidadModule),
      },
      {
        path: 'tipo-archivo',
        loadChildren: () =>
          import('./tipo-archivo/tipo-archivo.module').then(
            (m) => m.TipoArchivoModule
          ),
      },
      {
        path: 'perfil',
        loadChildren: () =>
          import('./perfil/perfil.module').then((m) => m.PerfilModule),
      },
      {
        path: '**',
        redirectTo: 'mi-bandeja',
      },
    ],
  },
  // {
  //   path: '**',
  //   redirectTo: 'dashboard/mi-bandeja',
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
