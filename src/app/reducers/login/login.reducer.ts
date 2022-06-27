import { Action, createReducer, on } from '@ngrx/store';
import * as loginActions from './login.actions';
import { Usuario } from '../../interfaces/resp-worker';

const estadoInicial: Usuario = {
    ok: null,
    mensaje: null,
    usuario: null,
    token: localStorage.getItem('token'),
    exp: null,
    iat: null,
};

// Obtener token
// tslint:disable-next-line: variable-name
const _loginReducer = createReducer(
    estadoInicial,

    on(loginActions.crearToken, (state: Usuario, { token }): any => {
        const worker: Usuario = {
            ...state,
            token
        };
        localStorage.setItem('token', worker.token);
        return worker;
    }),

    on(loginActions.refrescarToken, (state: Usuario, { usuario }): any => {
        const worker: Usuario = {
            ...usuario,
            iat: state.iat,
            exp: state.exp
        };
        localStorage.setItem('token', worker.token);
        return worker;
    }),

    on(loginActions.cargarWorker, (state: Usuario, { worker }): any => {
        const usuario: Usuario = {
            ...worker,
            token: worker.token
        };
        // console.log(usuario);
        return usuario;
    }),

    on(loginActions.obtenerToken, (state: Usuario, { token }): any => {
        const worker: Usuario = {
            ...state,
            token
        };
        return worker;
    }),

    on(loginActions.obtenerIdUsuario, (state: Usuario, { usuario }): any => {
        const worker: Usuario = {
            ...usuario,
            // iat: state.iat,
            // exp: state.exp,
        };
        // console.log(worker);
        return worker;
    }),

    on(loginActions.lognError, (state: Usuario): any => {
        return state;
    }),

);

export const loginReducer = (state: Usuario, action: Action) => {
    return _loginReducer(state, action);
};

