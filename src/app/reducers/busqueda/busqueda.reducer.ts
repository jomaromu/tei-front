import * as busquedaActions from './busqueda.actions';
import { Action, createReducer, on } from '@ngrx/store';

// const criterio: string = '';
const estadoInicial: ObjBusqueda = {
  criterio: '',
  estado: false,
};

const _busquedaReducer = createReducer(
  estadoInicial,

  on(busquedaActions.obtenerBusqueda, (state) => {
    return state;
  }),

  on(busquedaActions.crearBusqueda, (state, { objBusqueda }) => {
    return objBusqueda;
  })
);

export const busquedaReducer = (state: ObjBusqueda, action: Action) => {
  return _busquedaReducer(state, action);
};

export interface ObjBusqueda {
  criterio: string;
  estado?: boolean;
}
