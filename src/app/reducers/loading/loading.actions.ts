import { createAction, props } from '@ngrx/store';


export const cargarLoading = createAction(
    '[Loading] Cargar Loading'
);

export const quitarLoading = createAction(
    '[Loading] Quitar Loading'
);
