import { Injectable } from '@angular/core';
import { ProductoPedidoDB } from '../interfaces/producto-pedido';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers/globarReducers';
import { PedidoDB } from '../interfaces/pedido';
import { ProductoPedidoService } from '../services/producto-pedido.service';
import { PagoDB } from '../interfaces/pagos';

@Injectable({
  providedIn: 'root',
})
export class CalculosProductosPedidos {
  productosPedidos: Array<ProductoPedidoDB> = [];
  totales = {
    subtotal: 0,
    itbms: 0,
    total: 0,
  };

  mapPedidos: Array<any>;

  constructor(
    private store: Store<AppState>,
    private productoPedSer: ProductoPedidoService
  ) {}

  calcularCostos(
    productosPedidos: Array<ProductoPedidoDB>
  ): Array<ProductoPedidoDB> {
    return productosPedidos.map((productoPedido) =>
      this.costoProductoPedido(productoPedido)
    );
  }

  private costoProductoPedido(
    productoPedido: ProductoPedidoDB
  ): ProductoPedidoDB {
    let ITBMS: number = 0;
    const respProductosPedidos = {
      _id: null,
      pedido: null,
      producto: null,
      cantidad: null,
      precio: null,
      itbms: null,
      total: null,
      seg_disenio: null,
      seg_prod: null,
    };

    switch (productoPedido.itbms) {
      case true:
        ITBMS = 0.07;
        respProductosPedidos.itbms =
          productoPedido.cantidad * productoPedido.precio * ITBMS;
        respProductosPedidos.total =
          productoPedido.cantidad * productoPedido.precio +
          respProductosPedidos.itbms;
        break;
      case false:
        respProductosPedidos.itbms = ITBMS;
        respProductosPedidos.total =
          productoPedido.cantidad * productoPedido.precio +
          respProductosPedidos.itbms;
        break;
    }
    respProductosPedidos._id = productoPedido._id;
    respProductosPedidos.pedido = productoPedido.pedido;
    respProductosPedidos.producto = productoPedido.producto;
    respProductosPedidos.cantidad = productoPedido.cantidad;
    respProductosPedidos.precio = productoPedido.precio;
    respProductosPedidos.seg_disenio = productoPedido.seg_disenio;
    respProductosPedidos.seg_prod = productoPedido.seg_prod;

    return respProductosPedidos;
  }

  calcularTotales(productosPedidos: Array<any>): Array<any> {
    const arrayProds = _.cloneDeep(productosPedidos);
    const mapTotales = {
      subtotal: 0,
      itbms: 0,
      total: 0,
    };

    const mTotales = arrayProds.map((prodPed) => {
      // console.log(prodPed);
      const subProPed = prodPed.cantidad * prodPed.precio;
      mapTotales.subtotal = Number(
        (mapTotales.subtotal += subProPed).toFixed(2)
      );
      // mapTotales.subtotal = Number(
      //   (mapTotales.subtotal += prodPed.precio).toFixed(2)
      // );
      mapTotales.itbms = Number((mapTotales.itbms += prodPed.itbms).toFixed(2));
      mapTotales.total = Number((mapTotales.total += prodPed.total).toFixed(2));

      return mapTotales;
    });

    return mTotales;
  }

  calcularPagos(totales: TotalesPagos, pagos: Array<PagoDB>): TotalesPagos {
    if (!totales) {
      return;
    }
    let totalPagos = 0;
    let saldo = 0;
    const arrayPagos = _.cloneDeep(pagos);

    Object.assign(totales, { saldo: 0 });

    arrayPagos.forEach((pago) => {
      if (pago.estado) {
        totalPagos += pago.monto;
      }
    });

    saldo = totales.total - totalPagos;
    Object.assign(totales, { pagos: Number(totalPagos.toFixed(2)) });
    Object.assign(totales, { saldo: Number(saldo.toFixed(2)) });

    return totales;
  }

  mapTotalesDelPedido(pedidos: Array<PedidoDB>): any {
    // console.log(pedidos);
    let calcularPagos = {};
    return pedidos.map((pedido) => {
      const costoProd = this.calcularCostos(pedido.productosPedidos);
      const calcularTotales = this.calcularTotales(costoProd);

      const totales: TotalesPagos = [...new Set(calcularTotales)][0];

      if (totales) {
        this.calcularPagos(totales, pedido.pagos);
      }

      // console.log(totales);

      const pedidoDB = {
        pedidoDB: pedido,
        totales: totales,
      };

      return pedidoDB;
    });
  }
}

export interface TotalesPagos {
  subtotal: number;
  itbms: number;
  total: number;
  pagos: number;
  saldo: number;
}
