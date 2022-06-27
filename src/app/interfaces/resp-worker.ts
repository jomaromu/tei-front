export interface RespUser {
    ok: boolean;
    mensaje: string;
    token: string;
}

export interface Usuario {
    ok: boolean;
    mensaje: string;
    err?: {
        message: string;
    };
    token: string;
    usuario?: UsuarioWorker;
    usuarios?: Array<UsuarioWorker>;
    usuariosDB?: Array<UsuarioWorker>;
    iat: number;
    exp: number;
}

export interface UsuarioWorker {
    apellido: string;
    cantVisitas: number;
    colaborador_role: string;
    correo: string;
    estado: boolean;
    fecha_alta: string;
    fecha_login: string;
    idReferencia: string;
    nombre: string;
    telefono: string;
    identificacion: string;
    sucursal: any;
    permitidas: Array<string>;
    pedidos: Array<any>;
    _id: any;
}
