export interface ProductoPedido {
  ok: boolean;
  mensaje: string;
  productoPedido: ProductoPedidoDB;
  productosPedidos: Array<ProductoPedidoDB>;
}

export interface ProductoPedidoDB {
  _id: string;
  pedido: string;
  producto: string;
  precio: number;
  cantidad: number;
  seg_disenio: string;
  seg_prod: string;
  itbms: boolean;
  total: number;
}
