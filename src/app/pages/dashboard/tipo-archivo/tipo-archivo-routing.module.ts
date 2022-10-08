import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoArchivoComponent } from './tipo-archivo.component';

const routes: Routes = [
  {
    path: '',
    component: TipoArchivoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipoArchivoRoutingModule {}
