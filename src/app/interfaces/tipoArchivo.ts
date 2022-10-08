export interface TipoArchivo {
  ok: boolean;
  mensaje: string;
  err: any;
  tiposArchivosDB: Array<TipoArchivoDB>;
  tipoArchivoDB: TipoArchivoDB;
}

export interface TipoArchivoDB {
  estado: boolean;
  _id: string;
  idCreador: string;
  nombre: string;
}
