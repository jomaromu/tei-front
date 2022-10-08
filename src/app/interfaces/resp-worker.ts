// export interface RespUser {
//     ok: boolean;
//     mensaje: string;
//     token: string;
// }

export interface Usuario {
  ok: boolean;
  mensaje: string;
  err?: {
    message: string;
  };
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
  sucursal: any;
  role: any;
  _id: string;
}
