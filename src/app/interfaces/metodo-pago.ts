export interface MetodoPago {
    ok: boolean;
    mensaje: string;
    err: any;
    metodoDB: MetodoDB;
    metodosDB: Array<MetodoDB>;
}

interface MetodoDB {
    estado: boolean;
    _id: string;
    idCreador: string;
    nombre: string;
}
