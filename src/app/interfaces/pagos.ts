export interface Pagos {
  ok: boolean;
  pagoDB: PagoDB;
  pagosDB: Array<PagoDB>;
}

export interface PagoDB {
  _id: string;
  pedido: string;
  creador: string;
  fecha: string;
  motivo: string;
  modalidad: string;
  metodo: string;
  monto: number;
  estado: boolean;
}
