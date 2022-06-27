import { createAction, props } from '@ngrx/store';

export const obtenerEstado = createAction('[POR ENTREGAR] Obtener estado');

export const crearEstado = createAction(
  '[POR ENTREGAR] Crear estado',
  props<{ estado: boolean }>()
);
