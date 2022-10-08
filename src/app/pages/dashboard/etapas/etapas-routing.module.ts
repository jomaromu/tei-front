import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EtapasComponent } from './etapas.component';

const routes: Routes = [
  {
    path: '',
    component: EtapasComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class EtapasRoutingModule {}
