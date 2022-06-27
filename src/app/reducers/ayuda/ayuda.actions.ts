import { createAction, props } from '@ngrx/store';
import { AyudaDB } from '../../interfaces/ayuda';


export const cargarAyudas = createAction(
    '[Ayuda] Cargar Ayudas',
    props<{ayudas: Array<AyudaDB>}>()
);
