export interface Sucursal {
  ok: boolean;
  mensaje: string;
  err?: Error;
  sucursalDB?: SucursalesDB;
  sucursalesDB?: SucursalesDB[];
}

export interface SucursalesDB {
  telefono?: string;
  estado?: boolean;
  _id?: string;
  idCreador?: string;
  idReferencia?: string;
  nombre?: string;
  ubicacion?: Ubicacion;
  fecha_creacion?: string;
}

interface Ubicacion {
  pais: string;
  ciudad: string;
  _id: string;
  direccion: string;
}

interface Error {
  message: string;
  errors: {
    nombre: {
      message: string;
    }
  };
}
