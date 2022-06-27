export interface Pagos {
    ok: boolean;
    pagoDB: PagoDB;
    pagosDB: Array<PagoDB>;
}

export interface PagoDB {
    estado: boolean;
    fecha: string;
    idCreador: string;
    metodo: any;
    modalidad: number;
    monto: number;
    _id: string;
}
