import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/globarReducers';
import { ReportesService } from '../../services/reportes.service';
import * as moment from 'moment';
moment.locale('es');

import { read, utils, writeFileXLSX } from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tabla-reportes',
  templateUrl: './tabla-reportes.component.html',
  styleUrls: ['./tabla-reportes.component.scss'],
})
export class TablaReportesComponent implements OnInit {
  @Input() productosPedidos: any;
  objProdPedidos: any;
  totalReporte: number;
  arrayEtapas: Array<any>;

  @ViewChild('loading', { static: true })
  loading: ElementRef<HTMLElement>;
  // fechaActual = moment().format('YYYY-MM-DD');
  fechaActual = '';

  constructor(
    private reportesService: ReportesService,
    private store: Store<AppState>,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarEtapas();
    this.cargarProductosPedidos();
  }

  cargarEtapas(): any {
    const url = `../assets/etapas.json`;
    this.http.get(url).subscribe((etapas: Array<any>) => {
      this.arrayEtapas = etapas;
      // console.log(this.arrayEtapas);
    });
  }

  cargarProductosPedidos(): void {
    const loading = this.loading.nativeElement;
    // loading.style.display = 'flex';
    const detectProductos = setInterval(() => {
      if (this.productosPedidos) {
        const productosPedidosDBLocal: Array<any> =
          this.productosPedidos.productosPedidosDB;

        // console.log(this.productosPedidos);

        // return;

        const prodPedidos = productosPedidosDBLocal.map((prodPed) => {
          const objProdped = {
            pedido: {
              idReferencia: prodPed.Pedido[0]?.idReferencia,
              fecha_alta: prodPed.Pedido[0]?.fecha_alta,
              idCreador: {
                nombre: prodPed.Worker[0]?.nombre,
              },
              cliente: {
                nombre: prodPed.Cliente[0]?.nombre,
              },
              sucursal: {
                nombre: prodPed.Sucursal[0]?.nombre,
              },
              etapa: prodPed.Pedido[0]?.etapa_pedido,
            },
            producto: {
              nombre: prodPed.Producto[0]?.nombre,
              categoria: {
                nombre: prodPed.Categoria[0]?.nombre,
              },
            },
            cantidad: prodPed.cantidad,
            total: prodPed.total,
          };

          return objProdped;
        });

        const objProdPedidos = {
          ok: true,
          productosPedidosDB: prodPedidos,
        };

        this.objProdPedidos = objProdPedidos.productosPedidosDB;
        this.calcularTotal(objProdPedidos);
        // this.productosPedidos
        clearInterval(detectProductos);
        loading.style.display = 'none';
      }
    }, 1000);
  }

  cargarPorFecha(fechaInicial: string, fechaFinal: string): void {
    // console.log(fechaInicial, fechaFinal);
    const loading = this.loading.nativeElement;
    loading.style.display = 'flex';

    this.store.select('login').subscribe((usuario) => {
      const data = {
        token: usuario.token,
        fechaInicial,
        fechaFinal,
      };

      this.reportesService.busquedaPorFecha(data).subscribe((resp) => {
        // this.productosPedidos = resp;
        // this.calcularTotal(resp);
        // console.log(resp);
        const productosPedidosDBLocal: Array<any> = resp.productosPedidosDB;

        const prodPedidos = productosPedidosDBLocal.map((prodPed) => {
          const objProdped = {
            pedido: {
              idReferencia: prodPed.Pedido[0].idReferencia,
              fecha_alta: prodPed.Pedido[0].fecha_alta,
              idCreador: {
                nombre: prodPed.Worker[0].nombre,
              },
              cliente: {
                nombre: prodPed.Cliente[0].nombre,
              },
              sucursal: {
                nombre: prodPed.Sucursal[0].nombre,
              },
              etapa: prodPed.Pedido[0].etapa_pedido,
            },
            producto: {
              nombre: prodPed.Producto[0].nombre,
              categoria: {
                nombre: prodPed.Categoria[0].nombre,
              },
            },
            cantidad: prodPed.cantidad,
            total: prodPed.total,
          };

          return objProdped;
        });

        const objProdPedidos = {
          ok: true,
          productosPedidosDB: prodPedidos,
        };

        // this.productosPedidos = objProdPedidos;
        this.objProdPedidos = objProdPedidos.productosPedidosDB;
        this.calcularTotal(objProdPedidos);
        loading.style.display = 'none';
        // console.log(this.productosPedidos);
      });
    });
  }

  calcularTotal(productosPedidos: any): number {
    const arrayProductosPedidos: Array<any> =
      productosPedidos.productosPedidosDB;

    const filterTotalPedidos = arrayProductosPedidos.map((productoPedido) => {
      return productoPedido.total;
      // return productoPedido.total
    });

    // console.log(filterTotalPedidos);

    const totalProductosPedidos: number = filterTotalPedidos.reduce(
      (acc: number, current: number) => {
        return acc + current;
      },
      0
    );

    this.totalReporte = totalProductosPedidos;
    return this.totalReporte;
  }

  exportarExcel(): void {
    const prodPedDB: Array<any> = this.productosPedidos.productosPedidosDB;
    const totalRep: number = this.totalReporte;

    const tablaReportes = document.getElementById('tabla-reportes');

    /* generate worksheet */
    const ws = utils.table_to_sheet(tablaReportes, { cellDates: true });

    /* generate workbook and add the worksheet */
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Reportes por pedido');

    /* save to file */
    writeFileXLSX(wb, 'Reportes.xlsx');
    console.log(ws);
  }
}
