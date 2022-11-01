import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from '../../../reducers/globarReducers';
import * as menuActions from '../../../reducers/abrir-cerrar-sidebar/abrir-cerrar-sidebar-actions';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {}

  abrirCerrarMenu(): void {
    this.store
      .select('sidebar')
      .pipe(first())
      .subscribe((resp: boolean) => {
        this.store.dispatch(menuActions.abrirCerrarSidebar());
      });
  }
}
