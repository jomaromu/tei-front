import { createAction, props } from '@ngrx/store';
import { ObjBusqueda } from './busqueda.reducer';

export const obtenerBusqueda = createAction('[BUSQUEDA] Obtener Busqueda');

export const crearBusqueda = createAction(
  '[BUSQUEDA] Crear Busqueda',
  props<{ objBusqueda: ObjBusqueda }>()
);
