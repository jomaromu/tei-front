import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecuperarPassComponent } from './recuperar-pass/recuperar-pass.component';

const routes: Routes = [
  {
    path: '',
    component: RecuperarPassComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
})
export class RecuperarPassRoutingModule {}
