import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoutingPagesModule } from './routing-pages.module';
import { RouterModule } from '@angular/router';

// Componentes
import { BitacoraComponent } from './bitacora/bitacora.component';
import { FacturacionComponent } from './facturacion/facturacion.component';
import { ReportesComponent } from './reportes/reportes.component';
import { SharedModule } from '../shared/shared.module';

// pipes

@NgModule({
  declarations: [BitacoraComponent, FacturacionComponent, ReportesComponent],
  imports: [
    CommonModule,
    RoutingPagesModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    RouterModule,
  ],
  providers: [DatePipe],
  exports: [],
})
export class PagesModule {}
