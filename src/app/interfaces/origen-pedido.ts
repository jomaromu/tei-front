export interface OrigenPedido {
    ok: boolean;
    mensaje: string;
    err: any;
    origenDB: OrigenDB;
    origenesDB: Array<OrigenDB>;
}

interface OrigenDB {
    estado: boolean;
    _id: string;
    idCreador: string;
    nombre: string;
}
