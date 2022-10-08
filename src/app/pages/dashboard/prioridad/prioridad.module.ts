import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PrioridadRoutingModule } from './prioridad-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { PrioridadComponent } from './prioridad.component';

// PRIMENG
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import {OrderListModule} from 'primeng/orderlist';

// providers
import { Validaciones } from '../../../classes/validaciones';

@NgModule({
  declarations: [PrioridadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrioridadRoutingModule,
    SharedModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    OrderListModule
  ],
  providers: [Validaciones],
})
export class PrioridadModule {}
