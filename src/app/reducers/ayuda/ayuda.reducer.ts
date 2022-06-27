import * as ayudasActions from './ayuda.actions';
import { Action, createReducer, on } from '@ngrx/store';

import { AyudaDB } from '../../interfaces/ayuda';

const estadoInicial: Array<AyudaDB> = [{

    estado: null,
    _id: null,
    idCreador: null,
    nombre: null,
    descripcion: null
}];

// tslint:disable-next-line: variable-name
const _ayudaReducer = createReducer(
    estadoInicial,
    on(ayudasActions.cargarAyudas, (state, ayudas) => {
        return ayudas.ayudas;
    }),
);

export const ayudaReducer = (state: Array<AyudaDB>, action: Action) => {
    return _ayudaReducer(state, action);
};

