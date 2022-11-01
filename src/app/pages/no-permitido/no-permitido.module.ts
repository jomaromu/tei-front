import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// modulo
import { NoPermitidoRouteModule } from './no-permitido-routing.module';

// componente
import { NoPermitidoComponent } from './no-permitido/no-permitido.component';

@NgModule({
  declarations: [NoPermitidoComponent],
  imports: [CommonModule, NoPermitidoRouteModule],
})
export class NoPermitidoModule {}
