export interface Archivo {
  ok: boolean;
  mensaje: string;
  archivoDB: ArchivoDB;
  archivosDB: Array<ArchivoDB>;
}

export interface ArchivoDB {
  _id: string;
  archivo: string;
  nombre: string;
  tipo: string;
  idCreador: string;
  fecha: string;
  ext: string;
}
