import { Action, createReducer, on } from '@ngrx/store';
import * as loadingActions from './loading.actions';

const estadoInicial = false;

// tslint:disable-next-line: variable-name
const _loadingReducer = createReducer(
    estadoInicial,
    on(loadingActions.cargarLoading, state => true),

    on(loadingActions.quitarLoading, state => false)
);

export const loadingReducer = (state: boolean, action: Action) => {
    return _loadingReducer(state, action);
};
