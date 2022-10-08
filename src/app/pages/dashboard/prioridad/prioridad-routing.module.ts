import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PrioridadComponent } from './prioridad.component';

const routes: Routes = [
  {
    path: '',
    component: PrioridadComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class PrioridadRoutingModule {}
