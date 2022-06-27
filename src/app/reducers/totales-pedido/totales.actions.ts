import { createAction, props } from '@ngrx/store';

export const obtenerTotalesPedido = createAction(
    '[PEDIDO] OBTENER TOTALES',
    props<{ subtotal: number, itbms: number, pagos: number, total: number, pedido: number }>()
);

export interface ObjTotales {
    pedido: number; // totales
    itbms: number;
    pagos: number;
    subtotal: number;
    total: number;
}
