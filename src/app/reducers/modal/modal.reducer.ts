import { Action, createReducer, on } from '@ngrx/store';
import * as modalActions from './modal.actions';

const estadoInicial: ModalReducerInterface = {
    estado: false,
    tipo: null,
    data: null
};

// tslint:disable-next-line: variable-name
const _modalReducer = createReducer(
    estadoInicial,
    on(modalActions.cargarModal, (state, { tipo, estado, data }) => {
        const modal: ModalReducerInterface = {
            estado,
            tipo,
            data
        };

        return modal;
    }),

    on(modalActions.quitarModal, state => {
        const modal: ModalReducerInterface = {
            estado: false,
            tipo: null,
            data: null
        };

        return modal;
    })
);

export const modalReducer = (state: ModalReducerInterface, action: Action) => {
    return _modalReducer(state, action);
};

export interface ModalReducerInterface {
    estado: boolean;
    tipo: string;
    data: any;
}
