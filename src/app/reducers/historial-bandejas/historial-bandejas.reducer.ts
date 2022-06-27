import { Action, createReducer, on } from '@ngrx/store';
import * as historialBandejaActions from './historial-bandejas.actions';

const estadoInicial: MiBandeja = {
  bandeja: 'null',
  sucursal: 'null',
  usuario: 'null',
  temUserVend: 'null',
  temUserDise: 'null',
  cargaInicial: true,
  usoBandeja: false,
};

const _historialBandejaReducer = createReducer(
  estadoInicial,
  on(historialBandejaActions.crearHistorial, (state, { miBandeja }) => {
    return miBandeja;
  }),

  on(historialBandejaActions.obtenerHistorial, (state) => state)
);

export const historialBandejaReducer = (state: any, action: Action) => {
  return _historialBandejaReducer(state, action);
};

export interface MiBandeja {
  bandeja: string;
  sucursal: string;
  usuario: string;
  temUserVend: string;
  temUserDise: string;
  cargaInicial?: boolean;
  usoBandeja?: boolean;
}
