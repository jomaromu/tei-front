import { createAction, props } from '@ngrx/store';

export const obtenerPage = createAction('[PAGE] Obtener Page');

export const crearPage = createAction(
  '[PAGE] Crear Page',
  props<{ page: number }>()
);
