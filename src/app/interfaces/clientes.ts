export interface Cliente {
  ok: boolean;
  mensaje: string;
  usuariosDB?: UsuariosDB[];
  usuarioDB?: UsuariosDB;
  err?: any
}

export interface UsuariosDB {
  estado: boolean;
  _id: string;
  idReferencia: string;
  idCreador: string;
  nombre: string;
  apellido: string;
  identificacion?: string;
  cedula?: string;
  ruc: string;
  telefono: string;
  correo: string;
  fecha_alta: string;
  observacion: string;
  client_role: string;
  __v: number;
  sucursal: any; // corregir
}
