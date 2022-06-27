import { createAction, props } from '@ngrx/store';
import { Pedido } from '../../interfaces/pedido';


export const obtenerPedidos = createAction(
    '[PEDIDO] Obtener Pedidos',
    props<{ pedidos: Pedido }>()
);
