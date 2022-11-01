import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modulos
import { CategoriasRoutingModule } from './categorias-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';

import { CategoriasComponent } from './categorias.component';

// PRIMENG
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';

// providers
import { Validaciones } from '../../../classes/validaciones';

@NgModule({
  declarations: [CategoriasComponent],
  imports: [
    CommonModule,
    CategoriasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    LoadingModule,
  ],
  providers: [Validaciones],
})
export class CategoriasModule {}
