import * as pageActiosn from './page.actions';
import { Action, createReducer, on } from '@ngrx/store';

const page: number = 1;

const _pageReducer = createReducer(
  page,

  on(pageActiosn.obtenerPage, (state) => {
    return state;
  }),

  on(pageActiosn.crearPage, (state, { page }) => {
    return page;
  })
);

export const pageReducer = (state: number, action: Action) => {
  return _pageReducer(state, action);
};
