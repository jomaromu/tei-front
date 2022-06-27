import { Action, createReducer, on } from '@ngrx/store';
import { Pedido } from '../../interfaces/pedido';
import * as pedidoActions from './pedido.actions';

const estadoInicial: Pedido = {
    ok: null,
    cantidad: null,
    mensaje: null,
    pedidoDB: null,
    pedidosDB: null
};

// Obtener token
// tslint:disable-next-line: variable-name
const _pedidoReducer = createReducer(
    estadoInicial,

    on(pedidoActions.obtenerPedidos, (state, pedido) => {
        return pedido.pedidos;
    }),

);

export const pedidoReducer = (state: Pedido, action: Action) => {
    return _pedidoReducer(state, action);
};

