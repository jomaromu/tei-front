export interface Roles {
  ok: boolean;
  mensaje?: string;
  roleDB?: Role;
  rolesDB?: Array<Role>;
}

export interface Role {
  _id: string;
  idCreador: string;
  nombre: string;
  estado: boolean;
  vendedor: boolean;
  diseniador: boolean;
  restricciones: Restricciones;
}

export interface Restricciones {
  sidebar: {
    catalogo: boolean;
    sucursales: boolean;
    colaboradores: boolean;
    clientes: boolean;
    categorias: boolean;
    productos: boolean;
    roles: boolean;
    origen: boolean;
    prioridad: boolean;
    etapas: boolean;
    colores: boolean;
    metodos: boolean;
  };
}
