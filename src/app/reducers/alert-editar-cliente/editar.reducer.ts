import { Action, createReducer, on } from '@ngrx/store';
import * as abrirClienteActions from './editar.actions';

const estadoInicial: ObjCat = {
  abrir: false,
  tipo: '',
  idCat: '',
};

// tslint:disable-next-line: variable-name
const _editarClienteReducer = createReducer(
  estadoInicial,
  on(abrirClienteActions.abrirAlert, (state, alert) => {
    return alert.modalEditarCliente;
  })
);

export const editarClienteReducer = (state: ObjCat, action: Action) => {
  return _editarClienteReducer(state, action);
};

export interface ObjCat {
  abrir: boolean;
  tipo: string;
  idCat: string;
}
