export interface ModalidadPago {
  ok: boolean;
  mensaje: string;
  err: any;
  modalidadesDB: Array<ModalidadDB>;
  modalidadDB: ModalidadDB;
}

export interface ModalidadDB {
  estado: boolean;
  _id: string;
  idCreador: string;
  nombre: string;
}
