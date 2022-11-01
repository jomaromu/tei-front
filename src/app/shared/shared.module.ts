import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// COMPONENTESAS
import { SidebarComponent } from './sidebar/sidebar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TablaReportesComponent } from './tabla-reportes/tabla-reportes.component';

// PRIMENG
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuComponent } from './menu/menu/menu.component';

@NgModule({
  declarations: [
    SidebarComponent,
    NotFoundComponent,
    TablaReportesComponent,
    MenuComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
  ],
  exports: [SidebarComponent, TablaReportesComponent, MenuComponent],
})
export class SharedModule {}
