import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { forkJoin, timer, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { PedidoService } from '../../../services/pedido.service';
import { Usuario } from '../../../interfaces/resp-worker';
import { AppState } from '../../../reducers/globarReducers';
import { PrioridadService } from '../../../services/prioridad.service';
import { EtapasService } from '../../../services/etapas.service';
import { environment } from 'src/environments/environment';
import { PrioridadOrdenada } from '../../../interfaces/prioridad';
import { EtapaOrdenada } from '../../../interfaces/etapas';
import { Pedido, PedidoDB, PedidoDBBandeja } from '../../../interfaces/pedido';
import { OrdenarPedidos } from '../../../classes/ordenar-pedidos';
import { Router } from '@angular/router';
import { UsuariosDB } from '../../../interfaces/clientes';
import { CalculosProductosPedidos } from '../../../classes/calculos-productos-pedidos';
import { ArchivosService } from '../../../services/archivos.service';
import { ArchivoDB } from '../../../interfaces/archivo';
import Swal from 'sweetalert2';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { SelectItem, FilterMatchMode } from 'primeng/api';
import { Table } from 'primeng/table';
import { UserService } from '../../../services/user.service';
import { BandejaSocketService } from '../../../services/sockets/bandeja-socket.service';

@Component({
  selector: 'app-mi-bandeja',
  templateUrl: './mi-bandeja.component.html',
  styleUrls: ['./mi-bandeja.component.scss'],
})
export class MiBandejaComponent implements OnInit, OnDestroy {
  pedidos: Array<PedidoDBBandeja> = [];
  pedido: any;
  usuario: Usuario;
  displayDialogCrear = false;
  mapPedidos: Array<any> = [];
  pedidosSeleccionados: Array<PedidoDBBandeja> = [];
  matchModeOptions: SelectItem[];
  matchModeOptionsNumber: SelectItem[];
  loading = false;
  @ViewChild('dt', { static: false }) dt: Table;

  objBtnNuevo = {
    label: 'Nuevo',
    icon: 'pi pi-plus',
  };

  objBtnFiltros = {
    label: 'Limpiar filtros',
    icon: 'pi pi-filter-slash',
  };

  busquedaPedidosStorage: BusquedaStorage = {
    criterio: '',
    archivados: false,
  };

  archivados: boolean = false;

  constructor(
    private store: Store<AppState>,
    private pedidoService: PedidoService,
    private prioridadService: PrioridadService,
    private etapaSerivice: EtapasService,
    private ordenarPedidos: OrdenarPedidos,
    private router: Router,
    private calculosPedidos: CalculosProductosPedidos,
    private archivoService: ArchivosService,
    private bandejaSocket: BandejaSocketService,
    private breakpointObserver: BreakpointObserver,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cdref.detectChanges();
    this.cargarUsuario();
    this.cargarPedidosStorage();
    this.customDataFilter();
    this.limpiarPedidosSeleccionados();
    this.mediaQuery();
    this.obtenerPedidosSocket();
  }

  limpiarPedidosSeleccionados(): void {
    const time = timer(0, 300).subscribe((resp) => {
      if (this.pedidosSeleccionados) {
        this.pedidosSeleccionados = [];
        time.unsubscribe();
      }
    });
  }

  showDialog(tipo: string, pedido?: any) {
    this.pedido = pedido;
    if (!tipo) {
      tipo = 'crear';
    }
    if (tipo === 'crear') {
      this.displayDialogCrear = true;
      // console.log(this.displayDialogCrear);
    } else if (tipo === 'eliminar') {
      this.eliminarPedidos();
    }
  }

  cerrarDialogoCrear(e: boolean): void {
    this.displayDialogCrear = e;
  }

  cargarUsuario(): void {
    this.store.select('login').subscribe((usuario: Usuario) => {
      this.usuario = usuario;
    });
  }

  cargarPedidos(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(take(2))
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          this.pedidos = [];
          // console.log(usuario.usuarioDB);
          const dataPriods = {
            colPrioridad: environment.colPrioridad,
            token: usuario.token,
            foranea: '',
          };

          const dataEtapasOrds = {
            colEtapas: environment.colEtapas,
            token: usuario.token,
            foranea: '',
          };

          const sucursalesRest =
            usuario?.usuarioDB?.role?.restricciones?.bandeja?.sucursales;

          const etapas =
            usuario?.usuarioDB?.role?.restricciones?.bandeja?.etapas;

          let verPropias =
            usuario?.usuarioDB?.role?.restricciones?.bandeja?.verPropias;

          if (verPropias) {
            verPropias = 'true';
          } else {
            verPropias = 'false';
          }

          const dataGetPedidos = {
            token: usuario.token,
            sucursales: sucursalesRest,
            etapas: etapas,
            verPropias,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            dataPriods.foranea = usuario.usuarioDB._id;
            dataEtapasOrds.foranea = usuario.usuarioDB._id;
            dataGetPedidos.foranea = usuario.usuarioDB._id;
          } else {
            dataPriods.foranea = usuario.usuarioDB.foranea;
            dataEtapasOrds.foranea = usuario.usuarioDB.foranea;
            dataGetPedidos.foranea = usuario.usuarioDB.foranea;
          }

          // console.log(dataGetPedidos);
          const getPrioridadesOrds =
            this.prioridadService.obtenerPrioridadesOrdenadas(dataPriods);

          const getEtapasOrds =
            this.etapaSerivice.obtenerEtapasOrdenadas(dataEtapasOrds);

          const getPedidos = this.pedidoService.obtenerPedidos(dataGetPedidos);

          forkJoin<PrioridadOrdenada, EtapaOrdenada, Pedido>([
            getPrioridadesOrds,
            getEtapasOrds,
            getPedidos,
          ]).subscribe((resp) => {
            if (resp[0].ok && resp[1].ok && resp[2].ok) {
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              this.store.dispatch(loadingActions.quitarLoading());
            }

            const prioOrds = resp[0].prioridadesOrdenadaDB?.prioridades;
            const etapasOrds = resp[1].etapasOrdenadaDB?.etapas;
            const pedidos = resp[2].pedidosDB;

            const mapPedidos =
              this.calculosPedidos.mapTotalesDelPedido(pedidos);

            if (pedidos.length !== 0) {
              const respPedidos: Array<PedidoDBBandeja> =
                this.ordenarPedidos.ordenarBandeja({
                  etapasOrds,
                  prioOrds,
                  pedidos: mapPedidos,
                });

              this.pedidos = respPedidos;
              // console.log(this.pedidos);
            }
          });
        }
      });
  }

  buscarArchivados(): void {
    // this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          this.pedidos = [];
          const dataPriods = {
            colPrioridad: environment.colPrioridad,
            token: usuario.token,
            foranea: '',
          };

          const dataEtapasOrds = {
            colEtapas: environment.colEtapas,
            token: usuario.token,
            foranea: '',
          };

          const dataArchivados = {
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            dataPriods.foranea = usuario.usuarioDB._id;
            dataEtapasOrds.foranea = usuario.usuarioDB._id;
            dataArchivados.foranea = usuario.usuarioDB._id;
          } else {
            dataPriods.foranea = usuario.usuarioDB.foranea;
            dataEtapasOrds.foranea = usuario.usuarioDB.foranea;
            dataArchivados.foranea = usuario.usuarioDB.foranea;
          }
          const getPedidos =
            this.pedidoService.buscarArchivados(dataArchivados);
          const getPrioridadesOrds =
            this.prioridadService.obtenerPrioridadesOrdenadas(dataPriods);

          const getEtapasOrds =
            this.etapaSerivice.obtenerEtapasOrdenadas(dataEtapasOrds);

          forkJoin<PrioridadOrdenada, EtapaOrdenada, Pedido>([
            getPrioridadesOrds,
            getEtapasOrds,
            getPedidos,
          ]).subscribe((resp) => {
            const prioOrds = resp[0].prioridadesOrdenadaDB?.prioridades;
            const etapasOrds = resp[1].etapasOrdenadaDB?.etapas;
            const pedidos = resp[2].pedidosDB;

            if (resp[0].ok && resp[1].ok && resp[2].ok) {
              this.store.dispatch(loadingActions.quitarLoading());
            }

            const mapPedidos =
              this.calculosPedidos.mapTotalesDelPedido(pedidos);

            if (pedidos.length !== 0) {
              const respPedidos: Array<PedidoDBBandeja> =
                this.ordenarPedidos.ordenarBandeja({
                  etapasOrds,
                  prioOrds,
                  pedidos: mapPedidos,
                });

              this.pedidos = respPedidos;
            }
          });
        }
      });
  }

  cargarPedidosStorage(): void {
    const busquedaStg: BusquedaStorage = JSON.parse(
      localStorage.getItem('busqueda-pedidos') ||
        JSON.stringify(this.busquedaPedidosStorage)
    );

    this.archivados = busquedaStg.archivados;

    if (this.archivados) {
      this.buscarArchivados();
    } else {
      const time = timer(0, 30).subscribe((resp) => {
        const input = document.getElementById(
          'inputBusqueda'
        ) as HTMLInputElement;
        if (input) {
          if (busquedaStg && busquedaStg.criterio) {
            input.value = busquedaStg.criterio;
            this.buscarPedidosStorage();
          } else {
            this.cargarPedidos();
          }
          time.unsubscribe();
        } else {
          this.cargarPedidos();
          time.unsubscribe();
        }
      });
    }
  }

  crearPedido(e: string): void {
    if (e === 'crear-pedido') {
      this.cargarPedidos();
    }
  }

  abrirPedido(pedido: PedidoDB): void {
    const id: string = pedido._id;

    this.router.navigate(['dashboard', 'pedido'], {
      queryParamsHandling: 'merge',
      queryParams: { id },
    });
  }

  eliminarPedidos(): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar el(los) pedido(s)?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // this.store.dispatch(loadingActions.cargarLoading());
        this.store
          .select('login')
          // .pipe(first())
          .subscribe((usuario) => {
            if (usuario.usuarioDB) {
              const arrPedidos: Array<DataEliminarArchivo> =
                this.pedidosSeleccionados.map((pedSel) => {
                  const datosPed = {
                    idPedido: pedSel.pedidoDB._id,
                    archivos: pedSel.pedidoDB.archivos,
                    foranea: pedSel.pedidoDB.foranea,
                  };

                  return datosPed;
                });

              let foranea = '';
              if (usuario.usuarioDB.empresa) {
                foranea = usuario.usuarioDB._id;
              } else {
                foranea = usuario.usuarioDB.foranea;
              }
              // console.log(arrPedidos);
              // return
              arrPedidos.forEach((datosPedido) => {
                const data = {
                  token: usuario.token,
                  idPedido: datosPedido.idPedido,
                  foranea,
                };

                this.pedidoService
                  .eliminarPedido(data)
                  .pipe(
                    mergeMap((resp: any) => {
                      if (resp.ok) {
                        const data2 = {
                          token: usuario.token,
                          idPedido: datosPedido.idPedido,
                          archivos: datosPedido.archivos,
                          foranea,
                        };
                        return this.archivoService.eliminarArchivos(data2);
                      } else {
                        return of({
                          ok: false,
                        });
                      }
                    })
                  )
                  .subscribe((resp: any) => {
                    if (resp.ok) {
                      this.store.dispatch(loadingActions.quitarLoading());
                      this.cargarPedidos();

                      Swal.fire('Mensaje', 'Pedido(s) borrados', 'success');
                    } else {
                      this.store.dispatch(loadingActions.quitarLoading());
                      Swal.fire(
                        'Mensaje',
                        'Error al borrar el(los) pedido(s)',
                        'error'
                      );
                    }

                    if (!resp.ok) {
                      this.store.dispatch(loadingActions.quitarLoading());
                      Swal.fire(
                        'Mensaje',
                        'Error al borrar el(los) pedido(s)',
                        'error'
                      );
                    }
                    // console.log(resp);
                  });
              });
            }
          });
      }
    });
  }

  limpiarFiltros(dt: Table): void {
    const stateTable = localStorage.getItem('state-table');

    if (dt) {
      dt.clear();
      if (stateTable) {
        localStorage.removeItem('state-table');
      }
    }
  }

  customDataFilter(): void {
    this.matchModeOptions = [
      { label: 'Empiece con', value: FilterMatchMode.STARTS_WITH },
      { label: 'Que contenga', value: FilterMatchMode.CONTAINS },
      { label: 'Que no contenga', value: FilterMatchMode.NOT_CONTAINS },
      { label: 'Que Termine en', value: FilterMatchMode.ENDS_WITH },
      { label: 'Que no sea igual a', value: FilterMatchMode.NOT_EQUALS },
    ];

    this.matchModeOptionsNumber = [
      { label: 'Mayor que', value: FilterMatchMode.GREATER_THAN },
      { label: 'Menor que', value: FilterMatchMode.LESS_THAN },
    ];
  }

  setLocalStorage(e: Event): void {
    const value: string = (e.target as HTMLInputElement).value;
    this.busquedaPedidosStorage.criterio = value;
    this.busquedaPedidosStorage.archivados = false;
    this.archivados = false;
    const valueSrg = JSON.stringify(this.busquedaPedidosStorage);

    // console.log(valueSrg);
    localStorage.setItem('busqueda-pedidos', valueSrg);

    if (value === '') {
      this.cargarPedidos();
    } else {
      this.buscarPedidosStorage();
    }
  }

  buscarPedidosStorage(): void {
    // this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          let criterioPedidos: BusquedaStorage = JSON.parse(
            localStorage.getItem('busqueda-pedidos')
          );

          if (!criterioPedidos || !criterioPedidos.criterio) {
            criterioPedidos.criterio = '';
            this.cargarPedidos();
          } else {
            this.pedidos = [];
            const dataPriods = {
              colPrioridad: environment.colPrioridad,
              token: usuario.token,
              foranea: '',
            };

            const dataEtapasOrds = {
              colEtapas: environment.colEtapas,
              token: usuario.token,
              foranea: '',
            };

            const dataCriterio = {
              token: usuario.token,
              criterio: criterioPedidos.criterio,
              foranea: '',
            };

            if (usuario.usuarioDB.empresa) {
              dataPriods.foranea = usuario.usuarioDB._id;
              dataEtapasOrds.foranea = usuario.usuarioDB._id;
              dataCriterio.foranea = usuario.usuarioDB._id;
            } else {
              dataPriods.foranea = usuario.usuarioDB.foranea;
              dataEtapasOrds.foranea = usuario.usuarioDB.foranea;
              dataCriterio.foranea = usuario.usuarioDB.foranea;
            }

            const getPrioridadesOrds =
              this.prioridadService.obtenerPrioridadesOrdenadas(dataPriods);

            const getEtapasOrds =
              this.etapaSerivice.obtenerEtapasOrdenadas(dataEtapasOrds);

            const getPedidos = this.pedidoService.buscarPedidos(dataCriterio);

            forkJoin<PrioridadOrdenada, EtapaOrdenada, Pedido>([
              getPrioridadesOrds,
              getEtapasOrds,
              getPedidos,
            ]).subscribe((resp) => {
              const prioOrds = resp[0].prioridadesOrdenadaDB?.prioridades;
              const etapasOrds = resp[1].etapasOrdenadaDB?.etapas;
              const pedidos = resp[2].pedidosDB;

              if (resp[0].ok && resp[1].ok && resp[2].ok) {
                this.store.dispatch(loadingActions.quitarLoading());
              }

              const mapPedidos =
                this.calculosPedidos.mapTotalesDelPedido(pedidos);

              if (pedidos.length !== 0) {
                const respPedidos: Array<PedidoDBBandeja> =
                  this.ordenarPedidos.ordenarBandeja({
                    etapasOrds,
                    prioOrds,
                    pedidos: mapPedidos,
                  });

                this.pedidos = respPedidos;
              }
            });
          }
        }
      });
  }

  verArchivados(): void {
    if (this.archivados) {
      this.busquedaPedidosStorage.archivados = this.archivados;
      this.busquedaPedidosStorage.criterio = '';
      const input = document.getElementById(
        'inputBusqueda'
      ) as HTMLInputElement;
      input.value = this.busquedaPedidosStorage.criterio;
      this.buscarArchivados();
    } else {
      this.busquedaPedidosStorage.archivados = this.archivados;
      this.buscarPedidosStorage();
    }

    localStorage.setItem(
      'busqueda-pedidos',
      JSON.stringify(this.busquedaPedidosStorage)
    );
  }

  obtenerPedidosSocket(): void {
    this.bandejaSocket.escuchar('cargar-pedidos').subscribe((resp) => {
      this.cargarPedidosStorage();
    });
  }

  mediaQuery(): void {
    setTimeout(() => {
      this.breakpointObserver
        .observe(['(max-width: 444px)'])
        .subscribe((state: BreakpointState) => {
          const botones = document.getElementsByClassName('btn-small');

          const arrayBotones = Array.from(botones) as Array<HTMLButtonElement>;
          if (state.matches) {
            arrayBotones.forEach((boton) => {
              boton.style.fontSize = '0.7rem';
            });

            this.objBtnNuevo.label = '';
            this.objBtnFiltros.label = '';
          } else {
            arrayBotones.forEach((boton) => {
              boton.style.fontSize = '1rem';
              this.objBtnNuevo.label = 'Nuevo';
              this.objBtnFiltros.label = 'Limpiar filtros';
            });
          }
        });
    }, 1000);
  }

  ngOnDestroy(): void {}
}

/*
  1. crear diferentes sockets
    1.1 cuando se busca en la caja
    1.2 cuando es archivado
  2. el socket debe dispararse desde archivados, busqueda o eliminar
  3.
*/

interface DataEliminarArchivo {
  idPedido: string;
  archivos: Array<ArchivoDB>;
}

interface BusquedaStorage {
  criterio: string;
  archivados: boolean;
}
