import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// MODULO
import { SharedModule } from '../../shared/shared.module';
import { LoadingModule } from '../../shared/loading/loading.module';

// COMPONENTES
import { LoginComponent } from './login.component';

// routing
import { LoginRoutingModule } from './login-routing.module';

// primeng
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

// provider
import { Validaciones } from 'src/app/classes/validaciones';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    LoginRoutingModule,
    LoadingModule,
  ],
  providers: [Validaciones],
  exports: [],
})
export class LoginModule {}
