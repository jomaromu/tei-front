import { busquedaReducer, ObjBusqueda } from './busqueda/busqueda.reducer';
import { pageReducer } from './page-paginacion/page.reducer';
import { ActionReducerMap } from '@ngrx/store';
import { loginReducer } from './login/login.reducer';
import { loadingReducer } from './loading/loading.reducer';
import { ayudaReducer } from './ayuda/ayuda.reducer';
import { totalesReducer } from './totales-pedido/totales.reducer';

import { Usuario } from '../interfaces/resp-worker';
import { AyudaDB } from '../interfaces/ayuda';
import { modalReducer, ModalReducerInterface } from './modal/modal.reducer';
import {
  historialBandejaReducer,
  MiBandeja,
} from './historial-bandejas/historial-bandejas.reducer';
import { porEntregarReduer } from './por-entregar/por-entregar.reducer';
import {
  editarClienteReducer,
  ObjCat,
} from './alert-editar-cliente/editar.reducer';

export interface AppState {
  login: Usuario;
  loading: boolean;
  modal: ModalReducerInterface;
  ayuda: Array<AyudaDB>;
  totales: any;
  page: number;
  busqueda: ObjBusqueda;
  historialBandeja: MiBandeja;
  porEntregar: boolean;
  alertEditarCliente: ObjCat;
}

export const globalReducerApp: ActionReducerMap<AppState> = {
  login: loginReducer,
  loading: loadingReducer,
  modal: modalReducer,
  ayuda: ayudaReducer,
  totales: totalesReducer,
  page: pageReducer,
  busqueda: busquedaReducer,
  historialBandeja: historialBandejaReducer,
  porEntregar: porEntregarReduer,
  alertEditarCliente: editarClienteReducer,
};
