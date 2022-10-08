export interface Producto {
  ok: boolean;
  mensaje: string;
  err?: any;
  productosDB?: ProductoDB[];
  productoDB?: ProductoDB;
}

export interface ProductoDB {
  estado: boolean;
  _id: string;
  idReferencia: string;
  idCreador: string;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: any;
  fecha_alta: string;
  sucursal: any;
}
