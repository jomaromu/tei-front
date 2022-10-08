import { createAction, props } from '@ngrx/store';

export const abrirCerrarSidebar = createAction(
  '[SIDEBAR] ABRIR - CERRAR SIDEBAR'
);
export const abrirSidebar = createAction('[SIDEBAR] ABRIR SIDEBAR');
export const cerrarSidebar = createAction('[SIDEBAR] CERRAR SIDEBAR');
