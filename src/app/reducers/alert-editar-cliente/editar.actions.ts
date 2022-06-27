import { createAction, props } from '@ngrx/store';
import { ObjCat } from './editar.reducer';

export const abrirAlert = createAction(
  '[Abrir Alert Cliente] Abrir Alert Cliente',
  props<{ modalEditarCliente: ObjCat }>()
);
