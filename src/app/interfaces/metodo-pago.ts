export interface MetodoPago {
    ok: boolean;
    mensaje: string;
    err: any;
    metodosDB: Array<MetodoDB>;
    metodoDB: MetodoDB;
}

export interface MetodoDB {
    estado: boolean;
    _id: string;
    idCreador: string;
    nombre: string;
}
