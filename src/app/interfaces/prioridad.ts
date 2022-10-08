export interface Prioridad {
  ok: boolean;
  mensaje: string;
  err: any;
  prioridadDB?: PrioridadDB;
  prioridadesDB?: Array<PrioridadDB>;
}

export interface PrioridadDB {
  estado: boolean;
  _id: string;
  idCreador: string;
  nombre: string;
}

export interface PrioridadOrdenada {
  ok: boolean;
  mensaje: string;
  err: any;
  prioridadesOrdenadaDB: {
    colPrioridad: string;
    prioridades: Array<PrioridadDB>;
  };
}
