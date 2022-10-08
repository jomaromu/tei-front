export interface Etapa {
  ok: boolean;
  mensaje: string;
  err: any;
  etapaDB?: EtapaDB;
  etapasDB?: Array<EtapaDB>;
}

export interface EtapaDB {
  estado: boolean;
  _id: string;
  idCreador: string;
  nombre: string;
}

export interface EtapaOrdenada {
  ok: boolean;
  mensaje: string;
  err: any;
  etapasOrdenadaDB: {
    colEtapa: string;
    etapas: Array<EtapaDB>;
  };
}
