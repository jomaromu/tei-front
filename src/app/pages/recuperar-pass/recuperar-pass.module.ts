import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoadingModule } from 'src/app/shared/loading/loading.module';

// componente
import { RecuperarPassComponent } from './recuperar-pass/recuperar-pass.component';

// routing
import { RecuperarPassRoutingModule } from './recuperar-pass-routing.module';

// primeng
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Validaciones } from 'src/app/classes/validaciones';

@NgModule({
  declarations: [RecuperarPassComponent],
  imports: [
    CommonModule,
    RecuperarPassRoutingModule,
    RouterModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingModule,
  ],
  providers: [Validaciones],
})
export class RecuperarPassModule {}
