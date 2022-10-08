export interface Sucursal {
  ok: boolean;
  mensaje: string;
  err?: any;
  sucursalDB?: SucursalDB;
  sucursalesDB?: Array<SucursalDB>;
}

// export interface SucursalesDB {
//   telefono?: string;
//   estado?: boolean;
//   _id?: string;
//   idCreador?: string;
//   idReferencia?: string;
//   nombre?: string;
//   ubicacion?: string;
//   fecha_creacion?: string;
// }

export interface SucursalDB {
  _id?: string;
  idCreador?: any;
  nombre?: string;
  provincia?: Provincia;
  telefono?: string;
  direccion?: string;
  estado?: boolean;
  fecha_creacion?: string;
}

interface Provincia {
  id: string;
  name: string;
}
