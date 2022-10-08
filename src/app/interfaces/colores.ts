export interface Colores {
  ok: boolean;
  mensaje: string;
  coloresDB?: ColorDB[];
  colorDB?: ColorDB;
  err?: any;
}

export interface ColorDB {
  _id: string;
  idCreador: string;
  nombre: string;
  estado: boolean;
  color: string;
}
