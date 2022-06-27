import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/reducers/globarReducers';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent implements OnInit {
  productosPedidos: any;
  constructor(
    private reportesService: ReportesService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.store.select('login').subscribe((user) => {
      this.reportesService
        .obtenerTodos(user.token)
        .subscribe((productosPedidos) => {
          this.productosPedidos = productosPedidos;
          // console.log(productosPedidos);
        });
    });
  }
}
