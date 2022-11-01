import { ActionReducerMap } from '@ngrx/store';

import { loginReducer } from './login/login.reducer';
import { loadingReducer } from './loading/loading.reducer';
import { sidebarReducer } from './abrir-cerrar-sidebar/abrir-cerrar-sidebar.reducer';

import { Usuario } from '../interfaces/resp-worker';

export interface AppState {
  login: Usuario;
  loading: boolean;
  sidebar: boolean;
}

export const globalReducerApp: ActionReducerMap<AppState> = {
  login: loginReducer,
  loading: loadingReducer,
  sidebar: sidebarReducer,
};
