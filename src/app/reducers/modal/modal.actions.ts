import { createAction, props } from '@ngrx/store';


export const cargarModal = createAction(
    '[Modal] Cargar Modal',
    props<{ tipo: string, estado: boolean, data?: any }>()
);

export const quitarModal = createAction(
    '[Modal] Quitar Modal'
);
