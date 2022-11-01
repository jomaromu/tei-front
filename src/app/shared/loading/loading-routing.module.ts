import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoadingComponent } from './loading.component';

const routes: Routes = [
  {
    path: '',
    component: LoadingComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
})
export class LoadingRoutingModule {}
