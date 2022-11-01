export interface Roles {
  ok: boolean;
  mensaje?: string;
  err: any;
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
    bandeja: boolean;
    configuracion: boolean;
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
    modalidad: boolean;
    tipoArchivo: boolean;
  };
  bandeja: {
    buscadorGeneral: boolean;
    crearPedido: boolean;
    borrarPedido: boolean;
    verID: boolean;
    verFecha: boolean;
    verVendedor: boolean;
    verCliente: boolean;
    verTelefono: boolean;
    verSucursal: boolean;
    verTotal: boolean;
    verSaldo: boolean;
    verPrioridad: boolean;
    verEtapa: boolean;
    verEstado: boolean;
    verDise: boolean;
    etapas: [];
    sucursales: [];
    verPropias: string;
  };

  pedido: {
    informacion: {
      verInfo: boolean;
      verCliente: boolean;
      verTelefono: boolean;
      verCorreo: boolean;
      editarCliente: boolean;
      editarFechaEntrega: boolean;
      prioridad: {
        editar: boolean;
        disponibles: Array<any>;
      };
      etapa: {
        editar: boolean;
        disponibles: Array<any>;
      };
      diseniador: {
        editar: boolean;
        disponibles: Array<any>;
        verDistribucion: boolean;
      };
      estado: {
        editar: boolean;
        disponibles: Array<any>;
      };
      origen: {
        editar: boolean;
      };
      vendedor: {
        editar: boolean;
      };
      sucursal: {
        editar: boolean;
      };
    };
    productos: boolean;
    archivos: boolean;
    seguimiento: boolean;
    pagos: boolean;
  };
}
