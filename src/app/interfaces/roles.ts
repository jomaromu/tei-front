export interface Roles {
    ok: boolean;
    mensaje?: string;
    roleDB?: Role;
    rolesDB?: Array<Role>;
}

interface Role {
    _id: string;
    idCreador: string;
    nombre: string;
    nivel: number;
    estado: boolean;
}
