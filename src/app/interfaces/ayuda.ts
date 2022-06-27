export interface Ayuda {
    ok: boolean;
    mensaje: string;
    err: any;
    ayudaDB: AyudaDB;
    ayudasDB: Array<AyudaDB>;
}

export interface AyudaDB {
    estado: boolean;
    _id: string;
    idCreador: string;
    nombre: string;
    descripcion: string;
}
