// export interface RespUser {
//     ok: boolean;
//     mensaje: string;
//     token: string;
// }

import { Role } from './roleWorker';
import { SucursalDB } from './sucursales';

export interface Usuario {
  ok: boolean;
  mensaje: string;
  err?: any;
  token: string;
  usuarioDB?: UsuarioWorker;
  usuariosDB?: Array<UsuarioWorker>;
  iat: number;
  exp: number;
}

export interface UsuarioWorker {
  apellido: string;
  cantVisitas: number;
  correo: string;
  estado: boolean;
  fecha_alta: string;
  fecha_login: string;
  nombre: string;
  telefono: string;
  identificacion: string;
  sucursal: SucursalDB;
  role: Role;
  _id: string;
  empresa: boolean;
  foranea: any;
}
