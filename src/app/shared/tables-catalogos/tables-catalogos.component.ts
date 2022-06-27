import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/reducers/globarReducers';
import { CatalogoShared } from '../../interfaces/catalogo-shared';

@Component({
  selector: 'app-tables-catalogos',
  templateUrl: './tables-catalogos.component.html',
  styleUrls: ['./tables-catalogos.component.scss'],
})
export class TablesCatalogosComponent implements OnInit {
  @Input() catalogo: CatalogoShared;
  @Output() abrirAlertCat = new EventEmitter<any>();

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.abrirAlertEditarCliente();
  }

  alertCatalogo(tipo: string, idCat: string): void {
    const objCat = {
      tipo,
      idCat,
    };

    this.abrirAlertCat.emit(objCat);
  }

  abrirAlertEditarCliente(): void {
    // this.store.select('editarCliente').subscribe((data) => {
    //   this.alertCatalogo(data.tipo, data.idCat);
    // });
  }
}
