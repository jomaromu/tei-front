import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { forkJoin, timer } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { PedidoService } from '../../../services/pedido.service';
import { Usuario } from '../../../interfaces/resp-worker';
import { AppState } from '../../../reducers/globarReducers';
import { PrioridadService } from '../../../services/prioridad.service';
import { EtapasService } from '../../../services/etapas.service';
import { environment } from 'src/environments/environment';
import { PrioridadOrdenada } from '../../../interfaces/prioridad';
import { EtapaOrdenada } from '../../../interfaces/etapas';
import { Pedido, PedidoDB } from '../../../interfaces/pedido';
import { OrdenarPedidos } from '../../../classes/ordenar-pedidos';
import { Router } from '@angular/router';
import { UsuariosDB } from '../../../interfaces/clientes';
import { CalculosProductosPedidos } from 'src/app/classes/calculos-productos-pedidos';

@Component({
  selector: 'app-mi-bandeja',
  templateUrl: './mi-bandeja.component.html',
  styleUrls: ['./mi-bandeja.component.scss'],
})
export class MiBandejaComponent implements OnInit, OnDestroy {
  pedidos: Array<any> = [];
  pedido: any;
  usuario: Usuario;
  displayDialogCrear = false;
  mapPedidos: Array<any> = [];

  constructor(
    private store: Store<AppState>,
    private pedidoService: PedidoService,
    private prioridadService: PrioridadService,
    private etapaSerivice: EtapasService,
    private ordenarPedidos: OrdenarPedidos,
    private router: Router,
    private calculosPedidos: CalculosProductosPedidos
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarPedidos();
  }

  showDialog(tipo: string, pedido?: any) {
    this.pedido = pedido;
    if (!tipo) {
      tipo = 'crear';
    }
    if (tipo === 'crear') {
      this.displayDialogCrear = true;
      // console.log(this.displayDialogCrear);
    } else if (tipo === 'editar') {
    }
  }

  cerrarDialogoCrear(e: boolean): void {
    this.displayDialogCrear = e;
  }

  cargarUsuario(): void {
    this.store.select('login').subscribe((usuario: Usuario) => {
      this.usuario = usuario;
      // console.log(usuario);
    });
  }

  cargarPedidos(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.pedidos = [];
        const dataPriods = {
          colPrioridad: environment.colPrioridad,
          token: usuario.token,
        };

        const dataEtapasOrds = {
          colEtapas: environment.colEtapas,
          token: usuario.token,
        };
        const getPrioridadesOrds =
          this.prioridadService.obtenerPrioridadesOrdenadas(dataPriods);

        const getEtapasOrds =
          this.etapaSerivice.obtenerEtapasOrdenadas(dataEtapasOrds);

        const getPedidos = this.pedidoService.obtenerPedidos(usuario.token);

        forkJoin<PrioridadOrdenada, EtapaOrdenada, Pedido>([
          getPrioridadesOrds,
          getEtapasOrds,
          getPedidos,
        ]).subscribe((resp) => {
          const prioOrds = resp[0].prioridadesOrdenadaDB.prioridades;
          const etapasOrds = resp[1].etapasOrdenadaDB.etapas;
          const pedidos = resp[2].pedidosDB;

          const mapPedidos = this.calculosPedidos.mapTotalesDelPedido(pedidos);

          // console.log(mapPedidos);

          const respPedidos = this.ordenarPedidos.ordenarBandeja({
            etapasOrds,
            prioOrds,
            pedidos: mapPedidos,
          });

          this.pedidos = respPedidos;
        });
      });
  }

  crearPedido(e: string): void {
    if (e === 'crear-pedido') {
      this.cargarPedidos();
    }
  }

  abrirPedido(pedido: UsuariosDB): void {
    const id: string = pedido._id;

    this.router.navigate(['dashboard', 'pedido'], {
      queryParams: { id },
    });
  }

  ngOnDestroy(): void {}
}
