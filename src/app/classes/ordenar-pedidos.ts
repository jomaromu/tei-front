export class OrdenarPedidos {
  private pedidos: Array<any> = [];
  constructor() {}

  ordenarBandeja({ etapasOrds, prioOrds, pedidos }: paramsOrdenarBandeja): any {
    this.pedidos = [];
    for (let j = 0; j < etapasOrds.length; j++) {
      for (let i = 0; i < prioOrds.length; i++) {
        for (let k = 0; k < pedidos.length; k++) {
          if (
            etapasOrds[j]._id === pedidos[k].pedidoDB.etapa._id &&
            prioOrds[i]._id === pedidos[k].pedidoDB.prioridad._id
          ) {
            this.pedidos.push(pedidos[k]);
          }
        }
      }
    }

    return this.pedidos;
  }
}

interface paramsOrdenarBandeja {
  etapasOrds: Array<any>;
  prioOrds: Array<any>;
  pedidos: Array<any>;
}
