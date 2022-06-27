export interface ProductoPedido {
    ok: boolean;
    pedidoDB: PedidoDB;
    mensaje?: string;
    err?: string;
}

interface PedidoDB {
    archivos: any[];
    prioridad_pedido: number;
    etapa_pedido: number;
    productos_pedidos: Productospedido[];
    pagos_pedido: any[];
    estado: boolean;
    estado_pedido: number;
    itbms: boolean;
    saldo: number;
    total: number;
    _id: string;
    idCreador: string;
    idReferencia: string;
    fecha_alta: string;
    fecha_entrega: string;
    cliente: string;
    sucursal: string;
    asignado_a: string;
    origen_pedido: string;
}

export interface Productospedido {
    cantidad: number;
    precio: number;
    total: number;
    _id: string;
    producto: Producto;
    pedido: string;
}

interface Producto {
    estado: boolean;
    _id: string;
    idReferencia: string;
    idCreador: string;
    nombre: string;
    precio: number;
    descripcion: string;
    sucursal: string;
    categoria: string;
    fecha_alta: string;
}
