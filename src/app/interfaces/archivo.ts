export interface Archivo {
  ok: boolean;
  archivosDB: ArchivoDB[];
  mensaje: string;
  archivoDB: ArchivoDB;
  idPedido: string;
  cantidad: number;
}

export interface ArchivoDB {
  nombre_archivo: string;
  tipo: number;
  estado: boolean;
  _id: string;
  idReferencia: string;
  idCreador: IdCreador;
  pedido: string;
  fecha: string;
}

interface IdCreador {
  cantVisitas: number;
  estado: boolean;
  _id: string;
  idReferencia: string;
  nombre: string;
  apellido: string;
  identificacion?: any;
  telefono: string;
  correo: string;
  password: string;
  fecha_alta: string;
  colaborador_role: string;
  fecha_login: string;
  sucursal: string;
}
