import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PedidoRoutingModule } from './pedido-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { PedidoComponent } from './pedido.component';

// providers
import { Validaciones } from '../../../classes/validaciones';
import { CalculosProductosPedidos } from '../../../classes/calculos-productos-pedidos';

// PRIMENG
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { FieldsetModule } from 'primeng/fieldset';
import { InformacionComponent } from './informacion/informacion.component';
import { ProductosComponent } from './productos/productos.component';
import { ArchivosComponent } from './archivos/archivos.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { PagosComponent } from './pagos/pagos.component';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EnlacesPipe } from '../../../pipes/enlaces.pipe';
import { SplitterModule } from 'primeng/splitter';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {TooltipModule} from 'primeng/tooltip';

@NgModule({
  declarations: [
    PedidoComponent,
    InformacionComponent,
    ProductosComponent,
    ArchivosComponent,
    SeguimientoComponent,
    PagosComponent,
    EnlacesPipe,
  ],
  imports: [
    CommonModule,
    PedidoRoutingModule,
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
    TabViewModule,
    FieldsetModule,
    CalendarModule,
    InputNumberModule,
    FileUploadModule,
    RadioButtonModule,
    SplitterModule,
    ScrollPanelModule,
    InputTextareaModule,
    TooltipModule
  ],
  providers: [Validaciones, CalculosProductosPedidos],
})
export class PedidoModule {}
