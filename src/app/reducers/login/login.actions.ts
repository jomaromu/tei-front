import { createAction, props } from '@ngrx/store';
import { Usuario } from '../../interfaces/resp-worker';

export const crearToken = createAction(
    '[LOGIN] Crear Token',
    props<{ token: string }>()
);

export const cargarWorker = createAction(
    '[LOGIN] Cargar Worker',
    props<{ worker: Usuario }>()
);

export const obtenerToken = createAction(
    '[LOGIN] Obtener Token',
    props<{ token: string }>()
);

export const obtenerIdUsuario = createAction(
    '[LOGIN], Obtener ID Usuario',
    props<{ usuario: Usuario }>()
);

export const refrescarToken = createAction(
    '[LOGIN], Refrescar token',
    props<{ usuario: Usuario }>()
);

export const lognError = createAction(
    '[LOGIN], Login Error',
);




