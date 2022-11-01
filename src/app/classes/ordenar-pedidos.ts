export class OrdenarPedidos {
  private pedidos: Array<any> = [];
  constructor() {}

  ordenarBandeja({ etapasOrds, prioOrds, pedidos }: paramsOrdenarBandeja): any {
    this.pedidos = [];

    // console.log(pedidos);
    // console.log(etapasOrds);
    // console.log(prioOrds);

    for (let i = 0; i < etapasOrds.length; i++) {
      for (let j = 0; j < prioOrds.length; j++) {
        for (let k = 0; k < pedidos.length; k++) {
          if (pedidos && etapasOrds && prioOrds) {
            if (
              etapasOrds[i]?._id === pedidos[k].pedidoDB.etapa?._id &&
              prioOrds[j]?._id === pedidos[k].pedidoDB.prioridad?._id
            ) {
              this.pedidos.push(pedidos[k]);
            }
          }
        }
      }
    }

    return this.pedidos;
    // return;
    // for (let j = 0; j < etapasOrds.length; j++) {
    //   for (let i = 0; i < prioOrds.length; i++) {
    //     for (let k = 0; k < pedidos.length; k++) {
    //       if (
    //         etapasOrds[j]._id === pedidos[k].pedidoDB.etapa._id &&
    //         prioOrds[i]._id === pedidos[k].pedidoDB.prioridad._id
    //       ) {
    //         this.pedidos.push(pedidos[k]);
    //       }
    //     }
    //   }
    // }
  }
}

interface paramsOrdenarBandeja {
  etapasOrds: Array<any>;
  prioOrds: Array<any>;
  pedidos: Array<any>;
}
