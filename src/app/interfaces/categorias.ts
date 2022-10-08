export interface Categoria {
    ok: boolean;
    mensaje: string;
    err: any;
    categoriaDB: CategoriaDB;
    categoriasDB: Array<CategoriaDB>;
}

export interface CategoriaDB {
    estado: boolean;
    _id: string;
    idCreador: string;
    nombre: string;
}
