import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modulos
import { ColoresRoutingModule } from './colores-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingModule } from 'src/app/shared/loading/loading.module';

import { ColoresComponent } from './colores.component';

// PRIMENG
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';

// providers
import { Validaciones } from '../../../classes/validaciones';

@NgModule({
  declarations: [ColoresComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ColoresRoutingModule,
    SharedModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    InputNumberModule,
    ColorPickerModule,
    LoadingModule,
  ],
  providers: [Validaciones],
})
export class ColoresModule {}
