export interface Pedido {
  ok: boolean;
  mensaje: string;
  pedidoDB?: PedidoDB;
  pedidosDB?: PedidoDB[];
  cantidad: number;
  totalDB?: number;
  pedido: string;
}

export interface PedidoDB {
  _id: string;
  archivos: any[];
  productos_pedidos: any[];
  pagos_pedido: any[];
  estado: boolean;
  estado_pedido: string;
  itbms: boolean;
  monto_itbms: number;
  subtotal: number;
  total: number;
  saldo: number;
  idCreador: any;
  idReferencia: string;
  fecha_alta: string;
  fecha_entrega: string;
  cliente: Cliente;
  origen_pedido: any;
  Cliente: any[];
  prioridad_pedido: number;
  PrioridadPedido: any;
  Archivos: any[];
  ProductosPedidos: any[];
  PagosPedido: any[];
  IDCreador: IDCreador;
  AsignadoA: any;
  EtapaPedido: any;
  etapa_pedido: number;
  Sucursal: any;
  sucursal?: any;
  asignado_a: any;
}

interface Sucursal {
  _id: string;
  telefono: string;
  estado: boolean;
  idCreador: string;
  idReferencia: string;
  nombre: string;
  ubicacion: Ubicacion;
  fecha_creacion: string;
  __v: number;
}

interface Ubicacion {
  pais: string;
  ciudad: string;
  _id: string;
  direccion: string;
}

interface Cliente {
  _id: string;
  estado: boolean;
  idReferencia: string;
  idCreador: string;
  nombre: string;
  apellido?: any;
  identificacion?: any;
  ruc: string;
  telefono: string;
  correo: string;
  fecha_alta: string;
  observacion?: any;
  sucursal: string;
  client_role: string;
  __v: number;
}

interface IDCreador {
  _id: string;
  cantVisitas: number;
  estado: boolean;
  idReferencia: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  fecha_alta: string;
  colaborador_role: string;
  __v: number;
  fecha_login: string;
  sucursal?: string;
  identificacion: string;
}
