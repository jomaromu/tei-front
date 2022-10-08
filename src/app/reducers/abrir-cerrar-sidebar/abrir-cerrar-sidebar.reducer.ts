import { Action, createReducer, on } from '@ngrx/store';
import * as sidebarActions from './abrir-cerrar-sidebar-actions';

const estadoInicial = true;

// tslint:disable-next-line: variable-name
const _sidebarReducer = createReducer(
  estadoInicial,
  on(sidebarActions.abrirCerrarSidebar, (state) => !state),

  on(sidebarActions.abrirSidebar, (state) => true),

  on(sidebarActions.cerrarSidebar, (state) => false)
);

export const sidebarReducer = (state: boolean, action: Action) => {
  return _sidebarReducer(state, action);
};
