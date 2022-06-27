import { createAction, props } from '@ngrx/store';
import { MiBandeja } from './historial-bandejas.reducer';

export const crearHistorial = createAction(
  '[Historial] Crear Historial Bandeja',
  props<{ miBandeja: MiBandeja }>()
);
export const obtenerHistorial = createAction(
  '[Historial] Obtener Historial Bandeja'
);
