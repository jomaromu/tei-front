import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoutingPagesModule } from './routing-pages.module';
import { RouterModule } from '@angular/router';

// Componentes

// pipes

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RoutingPagesModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
  providers: [DatePipe],
  exports: [],
})
export class PagesModule {}
