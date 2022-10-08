import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ColoresComponent } from './colores.component';

const routes: Routes = [
  {
    path: '',
    component: ColoresComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColoresRoutingModule {}
