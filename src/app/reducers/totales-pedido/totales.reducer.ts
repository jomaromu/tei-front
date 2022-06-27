import { Action, createReducer, on } from '@ngrx/store';
import { ObjTotales, obtenerTotalesPedido } from './totales.actions';

const objTotal: ObjTotales = {

    pedido: 0,
    subtotal: 0,
    itbms: 0,
    pagos: 0,
    total: 0,
};


// Obtener token
// tslint:disable-next-line: variable-name
const _totalesReducer = createReducer(
    objTotal,

    on(obtenerTotalesPedido, (state, { subtotal, itbms, pagos, total, pedido }) => {

        const obj: ObjTotales = {
            pedido,
            subtotal,
            itbms,
            pagos,
            total
        };
        return obj;
    }),

);

export const totalesReducer = (state: any, action: Action) => {
    return _totalesReducer(state, action);
};
