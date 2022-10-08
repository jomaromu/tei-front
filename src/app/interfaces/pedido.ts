import { ProductoPedidoDB } from './producto-pedido';

export interface Pedido {
  ok: boolean;
  mensaje: string;
  pedidoDB?: PedidoDB;
  pedidosDB?: PedidoDB[];
}

export interface PedidoDB {
  _id: string;
  idReferencia: string;
  fechaRegistro: string;
  fechaEntrega: string;
  vendedor: any;
  diseniador: any;
  cliente: any;
  sucursal: any;
  prioridad: any;
  etapa: any;
  color: any;
  origen: any;
  productosPedidos: Array<ProductoPedidoDB>;
}
