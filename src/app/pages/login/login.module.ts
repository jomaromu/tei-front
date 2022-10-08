import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// MODULO
import { LoginRoutingModule } from './login-routing.module';

// COMPONENTES
import { LoginComponent } from './login.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [LoginRoutingModule, FormsModule, ReactiveFormsModule, CommonModule],
})
export class LoginModule {}
