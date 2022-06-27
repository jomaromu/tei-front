import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { Pedido, PedidoDB } from '../../interfaces/pedido';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/globarReducers';
import { first, concatMap, map } from 'rxjs/operators';
import { ObjTotales } from '../../reducers/totales-pedido/totales.actions';
import { Usuario } from '../../interfaces/resp-worker';
import { PedidoService } from '../../services/pedido.service';
import { PedidoSocketService } from './../../services/sockets/pedido-socket.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import * as porEntregarActions from '../../reducers/por-entregar/por-entregar.actions';
import { MiBandeja } from '../../reducers/historial-bandejas/historial-bandejas.reducer';
import * as historialBandejaActions from '../../reducers/historial-bandejas/historial-bandejas.actions';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';
import * as loadingAction from '../../reducers/loading/loading.actions';

@Component({
  selector: 'app-tabla-pedidos',
  templateUrl: './tabla-pedidos.component.html',
  styleUrls: ['./tabla-pedidos.component.scss'],
})
export class TablaPedidosComponent implements OnInit, OnDestroy {
  @Input() pedidos: Pedido;
  @ViewChild('cargarMas', { static: true })
  cargarMas: ElementRef<HTMLElement>;
  @ViewChild('loading', { static: true })
  loading: ElementRef<HTMLElement>;
  @ViewChild('checkEntregar', { static: false })
  checkEntregar: ElementRef<HTMLElement>;

  prioridades: any;
  etapas: any;
  estados: any;
  totalPedido: ObjTotales;
  worker: Usuario;
  workerSocket: Usuario;
  busquedaSocket: string;
  bandejaSocket: any;
  arrEstado = ['null', 'null'];
  page = 1;
  activarSocket = true;
  pedidosSocket: Subscription;
  roleNoPermitido: boolean;
  // cargaInicial = true;
  sub1: Subscription;
  sub2: Subscription;
  idUsuario: string;
  token: string;
  dataLoading = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private store: Store<AppState>,
    private pedidoService: PedidoService,
    private pedidoSocketService: PedidoSocketService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargaDePedidos();
    this.prioridadPedido();
    this.etapasPedido();
    this.estadosPedido();
    this.limpiarCheckPorEntregar();
    this.cargarPedidosDelSocket();
  }

  cargaDePedidos(): void {
    /* METODOS
        1. Cargar por bandejas = carga inicial "Tener en cuenta los que no tienen bandeja"
        1. Cargar por role
        2. Cargar por busqueda
        3. Cargar por porEntregar

        Si la carga inicial es true, cargo los pedidos por role
        Si la carga inicial es false, cargo por bandeja
        Si busco por bandeja, busqueda y porEntregar es falso y limpio y socket debe funcionar
        Si busco por busqueda, bandeja y porEntregar es falso y limpio y socket debe funcionar
        Si busco por porEntregar bandeja y busqueda son falsos y limpio y socket debe funcionar
    */

    this.sub1 = this.store.subscribe((dataReducer) => {
      const cargaInicial = dataReducer.historialBandeja.cargaInicial;
      const usoBandeja = dataReducer.historialBandeja.usoBandeja;
      const estadoBusqueda = dataReducer.busqueda.estado;
      const estadoPorEntregar = dataReducer.porEntregar;
      const loading = this.loading.nativeElement;

      if (!dataReducer.login.usuario) {
        return;
      }

      if (
        dataReducer.login.usuario.colaborador_role === 'DiseniadorRole' ||
        dataReducer.login.usuario.colaborador_role === 'DiseniadorVIPRole'
      ) {
        if (cargaInicial && !usoBandeja && !estadoBusqueda) {
          this.cargarPorRole(dataReducer, loading);
          // console.log('aca');
        } else if (!cargaInicial && !usoBandeja && !estadoBusqueda) {
          this.cargarPorRole(dataReducer, loading);
          // console.log('aqui');
        } else if (!cargaInicial && usoBandeja && !estadoBusqueda) {
          this.cargarPorBandejas(dataReducer, loading);
          // console.log('justo ahi');
        } else if (estadoBusqueda && !cargaInicial && !usoBandeja) {
          this.cargarPorBusqueda(dataReducer, loading);
          // console.log('mas aca');
        } else if (!cargaInicial && !usoBandeja && !estadoBusqueda) {
          this.cargarPorEntregar(dataReducer, loading);
          // console.log('mas aqui');
        }
      } else {
        const check: any = document.getElementById('checkPorEntregar');
        // console.log(check);
        if (check) {
          const estadoCheck = check.checked;
          if (cargaInicial && !usoBandeja && !estadoBusqueda && !estadoCheck) {
            this.cargarPorRole(dataReducer, loading);
            // console.log('aca');
          } else if (
            !cargaInicial &&
            !usoBandeja &&
            !estadoBusqueda &&
            !estadoCheck
          ) {
            this.cargarPorRole(dataReducer, loading);
            // console.log('aqui');
          } else if (
            !cargaInicial &&
            usoBandeja &&
            !estadoBusqueda &&
            !estadoCheck
          ) {
            this.cargarPorBandejas(dataReducer, loading);
            // console.log('justo ahi');
          } else if (
            estadoBusqueda &&
            !cargaInicial &&
            !usoBandeja &&
            !estadoCheck
          ) {
            this.cargarPorBusqueda(dataReducer, loading);
            // console.log('mas aca');
          } else if (
            estadoCheck &&
            !cargaInicial &&
            !usoBandeja &&
            !estadoBusqueda
          ) {
            this.cargarPorEntregar(dataReducer, loading);
            // console.log('mas aqui');
          }
        }
      }
    });
  }

  cargarPorRole(dataReducer: AppState, loading: HTMLElement): void {
    const worker = dataReducer.login;
    loading.style.display = 'flex';

    if (!worker.usuario) {
      return;
    }
    const data = {
      token: worker?.token,
      role: worker?.usuario?.colaborador_role,
      idSucursalWorker:
        worker?.usuario?.sucursal || worker?.usuario?.sucursal?._id || '',
      idUsuario: worker?.usuario?._id,
    };

    // return this.pedidoService.obtenerPedidosPorRole(data);
    this.pedidoService
      .obtenerPedidosPorRole(data)
      .pipe(first())
      .subscribe((pedidos) => {
        this.pedidos = pedidos;
        loading.style.display = 'none';
        // console.log('ok');
      });
  }

  cargarPorBandejas(dataReducer: AppState, loading: HTMLElement): void {
    // console.log('ok');
    const worker = dataReducer.login;
    loading.style.display = 'flex';
    // this.store.dispatch(loadingAction.cargarLoading());

    if (!worker.usuario) {
      return;
    }
    const data = {
      token: worker.token,
      sucursal: dataReducer.historialBandeja.sucursal,
      userID: dataReducer.historialBandeja.usuario,
      bandejas: dataReducer.historialBandeja.bandeja,
    };

    // return this.pedidoService.busquedaBandejas(data);
    this.pedidoService
      .busquedaBandejas(data)
      .pipe(first())
      .subscribe((pedidos) => {
        this.pedidos = pedidos;
        loading.style.display = 'none';
        // this.store.dispatch(loadingAction.quitarLoading());
      });
  }

  cargarPorBusqueda(dataReducer: AppState, loading: HTMLElement): void {
    if (!dataReducer.login.usuario) {
      return;
    }
    loading.style.display = 'flex';
    const data = {
      token: dataReducer.login.token,
      role: dataReducer?.login.usuario?.colaborador_role,
      idSucursalWorker:
        dataReducer?.login?.usuario?.sucursal ||
        dataReducer?.login.usuario?.sucursal?._id,
      idUsuario: dataReducer?.login?.usuario?._id,
      criterio: dataReducer.busqueda.criterio,
    };

    if (dataReducer.busqueda.criterio !== '') {
      // return this.pedidoService.obtenerPorBusqueda(data);
      this.pedidoService
        .obtenerPorBusqueda(data)
        .pipe(first())
        .subscribe((pedidos: Pedido) => {
          this.pedidos = pedidos;
          loading.style.display = 'none';
        });
    }
  }

  cargarPorEntregar(dataReducer: AppState, loading: HTMLElement): void {
    // return this.pedidoService.porEntregar(dataReducer.login.token);
    loading.style.display = 'flex';
    this.pedidoService
      .porEntregar(dataReducer.login.token)
      .pipe(first())
      .subscribe((pedidos: Pedido) => {
        this.pedidos = pedidos;
        loading.style.display = 'none';
      });
  }

  porEntregar(check: any): void {
    const valorEstado = check.target.checked;
    this.store.pipe(first()).subscribe((dataReducer) => {
      const miBandeja: MiBandeja = {
        bandeja: 'null',
        sucursal: 'null',
        usuario: 'null',
        temUserVend: 'null',
        temUserDise: 'null',
        cargaInicial: false,
      };

      this.store.dispatch(
        historialBandejaActions.crearHistorial({ miBandeja })
      );

      const ObJBusqueda: ObjBusqueda = {
        criterio: '',
        estado: false,
      };
      this.store.dispatch(
        busquedaActions.crearBusqueda({ objBusqueda: ObJBusqueda })
      );

      this.store.dispatch(
        porEntregarActions.crearEstado({ estado: valorEstado })
      );
    });
  }

  cargarUsuario(): void {
    this.store.select('login').subscribe((worker) => {
      this.worker = worker;
      // console.log(this.worker);
      if (
        worker?.usuario?.colaborador_role === 'DiseniadorRole' ||
        worker?.usuario?.colaborador_role === 'DiseniadorVIPRole'
      ) {
        this.roleNoPermitido = true;
      }
      // console.log('desde cargar usuario');
    });
  }

  abrirPedido(pedido: PedidoDB): void {
    // console.log(pedido._id);
    this.router.navigate(['/dashboard/pedido'], {
      queryParams: { id: pedido._id },
    });
  }

  prioridadPedido(): void {
    this.http
      .get('../../../assets/prioridad.json')
      .pipe()
      .subscribe((prioridades: Array<any>) => {
        this.prioridades = prioridades;
      });
  }

  etapasPedido(): void {
    this.http
      .get('../../../assets/etapas.json')
      .pipe()
      .subscribe((etapas: Array<any>) => {
        this.etapas = etapas;
      });
  }

  estadosPedido(): void {
    this.http
      .get('../../../assets/estados.json')
      .pipe()
      .subscribe((estados: Array<any>) => {
        this.estados = estados;
      });
  }

  limpiarCheckPorEntregar(): void {
    this.store.select('porEntregar').subscribe((data) => {
      const check: any = document.getElementById('checkPorEntregar');

      if (check) {
        check.checked = data;
      }
    });
  }

  cargarPedidosDelSocket(): void {
    this.pedidoSocketService
      .escuchar('recibir-pedidos')
      .subscribe((pedidos: Pedido) => {
        this.store.pipe(first()).subscribe((dataReducer) => {
          const cargaInicial = dataReducer.historialBandeja.cargaInicial;
          const usoBandeja = dataReducer.historialBandeja.usoBandeja;
          const estadoBusqueda = dataReducer.busqueda.estado;
          const estadoPorEntregar = dataReducer.porEntregar;
          const loading = this.loading.nativeElement;

          if (!dataReducer.login.usuario) {
            return;
          }

          if (
            dataReducer.login.usuario.colaborador_role === 'DiseniadorRole' ||
            dataReducer.login.usuario.colaborador_role === 'DiseniadorVIPRole'
          ) {
            if (cargaInicial && !usoBandeja && !estadoBusqueda) {
              this.cargarPorRole(dataReducer, loading);
              // console.log('aca');
            } else if (!cargaInicial && !usoBandeja && !estadoBusqueda) {
              this.cargarPorRole(dataReducer, loading);
              // console.log('aqui');
            } else if (!cargaInicial && usoBandeja && !estadoBusqueda) {
              this.cargarPorBandejas(dataReducer, loading);
              // console.log('justo ahi');
            } else if (estadoBusqueda && !cargaInicial && !usoBandeja) {
              this.cargarPorBusqueda(dataReducer, loading);
              // console.log('mas aca');
            } else if (!cargaInicial && !usoBandeja && !estadoBusqueda) {
              this.cargarPorEntregar(dataReducer, loading);
              // console.log('mas aqui');
            }
          } else {
            const check: any = document.getElementById('checkPorEntregar');
            if (check) {
              const estadoCheck = check.checked;
              if (
                cargaInicial &&
                !usoBandeja &&
                !estadoBusqueda &&
                !estadoCheck
              ) {
                this.cargarPorRole(dataReducer, loading);
                // console.log('aca');
              } else if (
                !cargaInicial &&
                !usoBandeja &&
                !estadoBusqueda &&
                !estadoCheck
              ) {
                this.cargarPorRole(dataReducer, loading);
                // console.log('aqui');
              } else if (
                !cargaInicial &&
                usoBandeja &&
                !estadoBusqueda &&
                !estadoCheck
              ) {
                this.cargarPorBandejas(dataReducer, loading);
                // console.log('justo ahi');
              } else if (
                estadoBusqueda &&
                !cargaInicial &&
                !usoBandeja &&
                !estadoCheck
              ) {
                this.cargarPorBusqueda(dataReducer, loading);
                // console.log('mas aca');
              } else if (
                estadoCheck &&
                !cargaInicial &&
                !usoBandeja &&
                !estadoBusqueda
              ) {
                this.cargarPorEntregar(dataReducer, loading);
                // console.log('mas aqui');
              }
            }
          }
        });
      });
  }

  cargarPedidosSocket(): void {
    // return;
    this.store.pipe(first()).subscribe((datarReducer) => {
      const worker = datarReducer.login;
      const historial = datarReducer.busqueda;
      if (worker.usuario) {
        if (
          worker.usuario.colaborador_role !== 'AdminRole' &&
          worker.usuario.colaborador_role !== 'SuperRole' &&
          worker.usuario.colaborador_role !== 'ProduccionVIPRole' &&
          worker.usuario.colaborador_role !== 'DiseniadorVIPRole'
        ) {
          this.pedidoSocketService
            .escuchar('recibir-pedidos')
            .subscribe((pedidosSockets) => {
              // console.log('sin bandeja');
              const data = {
                token: worker.token,
                role: worker.usuario.colaborador_role,
                idSucursalWorker:
                  worker.usuario.sucursal || worker.usuario.sucursal._id,
                idUsuario: worker.usuario._id,
              };
              this.pedidoService
                .obtenerPedidosPorRole(data)
                .pipe(first())
                .subscribe((pedidos: Pedido) => {
                  this.pedidos = pedidos;
                });
            });
        } else {
          this.pedidoSocketService
            .escuchar('recibir-pedidos')
            .pipe(
              concatMap((respSocket) => {
                return this.userService
                  .obtenerHistorial(worker.usuario._id)
                  .pipe(
                    concatMap((historial) => {
                      const data = {
                        token: worker.token,
                        sucursal: historial.historialDB.sucursal,
                        userID: historial.historialDB.usuario,
                        bandejas: historial.historialDB.bandeja,
                      };
                      return this.pedidoService.busquedaBandejas(data);
                    })
                  );
              })
            )
            .subscribe((pedidos: Pedido) => {
              this.pedidos = pedidos;
            });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.pedidoSocketService.quitarSubscripcion('recibir-pedidos');
    this.sub1.unsubscribe();
    // this.sub2.unsubscribe();
  }
}
