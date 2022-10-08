export interface OrigenPedido {
  ok: boolean;
  mensaje: string;
  err: any;
  origenesDB: Array<OrigenDB>;
  origenDB: OrigenDB;
}

export interface OrigenDB {
  estado: boolean;
  _id: string;
  idCreador: string;
  nombre: string;
}
