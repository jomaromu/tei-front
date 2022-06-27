import * as porEngrarActions from './por-entregar.actions';
import { Action, createReducer, on } from '@ngrx/store';

// const criterio: string = '';
const estado = false;

const _porEntregarReduer = createReducer(
  estado,

  on(porEngrarActions.obtenerEstado, (state) => {
    return state;
  }),

  on(porEngrarActions.crearEstado, (state, { estado }) => {
    return estado;
  })
);

export const porEntregarReduer = (state: boolean, action: Action) => {
  return _porEntregarReduer(state, action);
};
