import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { forkJoin, timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from '../../../../classes/validaciones';
import { MetodoDB, MetodoPago } from '../../../../interfaces/metodo-pago';
import { ModalidadDB, ModalidadPago } from '../../../../interfaces/modalidades';
import { Pagos, PagoDB } from '../../../../interfaces/pagos';
import { PedidoDB } from '../../../../interfaces/pedido';
import { AppState } from '../../../../reducers/globarReducers';
import { MetodoPagoService } from '../../../../services/metodo-pago.service';
import { ModadlidadService } from '../../../../services/modadlidad.service';
import { PagosService } from '../../../../services/pagos.service';
import * as moment from 'moment';
import * as loadingActions from '../../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import {
  CalculosProductosPedidos,
  TotalesPagos,
} from '../../../../classes/calculos-productos-pedidos';
import { ProductoPedidoService } from '../../../../services/producto-pedido.service';
import { ProductoPedido } from '../../../../interfaces/producto-pedido';
import { FiltrarEstados } from '../../../../classes/filtrar-estados';
import { PagosSocketService } from '../../../../services/sockets/pagos-socket.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
})
export class PagosComponent implements OnInit {
  @Input() pedido: PedidoDB;
  pagos: Array<PagoDB> = [];
  modalidades: Array<ModalidadDB> = [];
  metoddos: Array<MetodoDB> = [];
  pago: PagoDB;
  forma: FormGroup;
  displayDialogCrear = false;
  modalEstado = false;
  mostrarMotivo = false;
  motivo: string;
  checked = true;
  totales: TotalesPagos;
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private modalidadService: ModadlidadService,
    private metodoService: MetodoPagoService,
    private validadores: Validaciones,
    private pagoService: PagosService,
    private route: ActivatedRoute,
    private cacularCostos: CalculosProductosPedidos,
    private proPedSer: ProductoPedidoService,
    private filtrarEstados: FiltrarEstados,
    private pagosSocket: PagosSocketService,
    private breakPointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.cargarPedido();
    this.crearFormulario();
    this.cargarCatalogos();
    this.obtenerPagos();
    this.cargarPagosSocket();
    this.mediaQuery();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cargarPedido();
  }

  cargarPedido(): void {
    const time = timer(0, 1000).subscribe((resp) => {
      // console.log(this.pedido);

      if (this.pedido) {
        time.unsubscribe();
      }

      if (resp > 10) {
        time.unsubscribe();
      }
    });
  }

  cargarCatalogos(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }
          const obtenerModalidades =
            this.modalidadService.obtenerModalidades(data);

          const obtenerMetodos = this.metodoService.obtenerMetodos(data);

          forkJoin([obtenerModalidades, obtenerMetodos]).subscribe(
            (resp: [ModalidadPago, MetodoPago]) => {
              if (resp[0].ok && resp[1].ok) {
                this.modalidades = this.filtrarEstados.filtrarActivos(
                  resp[0].modalidadesDB
                );
                this.metoddos = this.filtrarEstados.filtrarActivos(
                  resp[1].metodosDB
                );
              }
            }
          );
        }
      });
  }

  obtenerPagos(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe(async (usuario) => {
        if (usuario.usuarioDB) {
          this.route.queryParams.subscribe((resp) => {
            const data = {
              token: usuario.token,
              pedido: resp.id,
              foranea: '',
            };

            if (usuario.usuarioDB.empresa) {
              data.foranea = usuario.usuarioDB._id;
            } else {
              data.foranea = usuario.usuarioDB.foranea;
            }

            const getProdpeds = this.proPedSer.obtenerProductosPedidos(data);
            const getPagos = this.pagoService.obtenerPagosPorPedido(data);

            forkJoin([getProdpeds, getPagos]).subscribe(
              (resp: [ProductoPedido, Pagos]) => {
                const proPeds = resp[0];
                const pagos = resp[1];

                if (proPeds.ok && pagos.ok) {
                  const totales = [
                    ...new Set(
                      this.cacularCostos.calcularTotales(
                        this.cacularCostos.calcularCostos(
                          proPeds.productosPedidos
                        )
                      )
                    ),
                  ][0];

                  this.totales = this.cacularCostos.calcularPagos(
                    totales,
                    pagos.pagosDB
                  );
                  this.pagos = pagos.pagosDB;
                  this.store.dispatch(loadingActions.quitarLoading());
                } else {
                  Swal.fire('Mensaje', 'Error al cargar los pagos', 'error');
                  this.store.dispatch(loadingActions.quitarLoading());
                }
              }
            );
          });
        }
      });
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      modalidad: [],
      metodo: [],
      monto: [0],
      estado: [true],
    });
  }

  limpiarFormulario(): void {
    this.forma.controls.modalidad.reset();
    this.forma.controls.metodo.reset();
    this.forma.controls.monto.reset();
  }

  showDialog(tipo: string, pago?: any) {
    this.pago = pago;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
      // console.log(this.totales);
      this.forma.controls.monto.setValue(this.totales?.saldo);
      // this.cargarTiposArchivos();
      // this.removeContent();

      // console.log(this.tiposArchivos);
    } else if (tipo === 'editar') {
      // this.cargarFormularioEditar(sucursal);
      // this.displayDialogEditar = true;
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.modalEstado = false;
    this.mostrarMotivo = false;
    this.limpiarFormulario();

    this.obtenerPagos();
  }

  get validarModalidad(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.modalidades,
      value: this.forma.controls.modalidad.value,
    });
  }

  get validarMetodo(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.metoddos,
      value: this.forma.controls.metodo.value,
    });
  }

  get validarMonto(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: true,
      size: false,
      value: this.forma.controls.monto.value,
    });
  }

  btnGuardar(): void {
    if (
      !this.validarModalidad.valido ||
      !this.validarMetodo.valido ||
      !this.validarMonto.valido
    ) {
      this.forma.markAllAsTouched();
      return;
    } else {
      this.crearPago();
    }
  }

  crearPago(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            creador: usuario.usuarioDB._id,
            modalidad: this.forma.controls.modalidad.value?._id,
            metodo: this.forma.controls.metodo.value?._id,
            fecha: moment().format('DD/MM/YYYY'),
            monto: Number(this.forma.controls.monto.value).toFixed(2),
            // estado: this.forma.controls.estado.value,
            token: usuario.token,
            pedido: this.pedido._id,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }
          this.pagoService.crearPago(data).subscribe((pagos: Pagos) => {
            if (pagos.ok) {
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Pago creado', 'success');
              this.obtenerPagos();
              this.limpiarFormulario();
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', `Error al crear un pago`, 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!pagos) {
              Swal.fire('Mensaje', 'Error al crear un pago', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  showEstadoPago(e: any, pago: PagoDB): void {
    this.pago = pago;
    const estado = e.checked;
    if (!estado) {
      this.modalEstado = true;
    }
  }

  btnGuardarEstado(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const motivo = document.getElementById(
            'motivo-deshabilitar'
          ) as HTMLInputElement;

          const data = {
            token: usuario.token,
            motivo: motivo.value,
            pago: this.pago._id,
            estado: false,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          console.log(data.pago);

          this.pagoService.editarMotivo(data).subscribe((pago: Pagos) => {
            if (pago.ok) {
              // console.log(pago);
              this.modalEstado = false;
              this.obtenerPagos();
            } else {
              Swal.fire('Mensaje', 'Error crear editar el pago', 'error');
            }
          });
        }
      });
  }

  verMotivo(pago: PagoDB): void {
    this.mostrarMotivo = true;
    this.motivo = pago.motivo;
  }

  mediaQuery(): void {
    this.breakPointObserver
      .observe(['(max-width: 544px)'])
      .subscribe((state: BreakpointState) => {
        const time = timer(0, 300).subscribe((resp) => {
          const wrapTablaPagos = document.getElementById(
            'wrap-tabla-pagos'
          ) as HTMLElement;
          const tabView = document.querySelectorAll(
            '.p-tabview-panels'
          )[0] as HTMLElement;

          if (wrapTablaPagos && tabView) {
            if (state.matches) {
              wrapTablaPagos.style.padding = '1.2rem 0';
              tabView.style.padding = '25px 0';
            } else {
              wrapTablaPagos.style.padding = '1.2rem';
              tabView.style.padding = '25px';
            }

            time.unsubscribe();
          }
        });
      });
  }

  cargarPagosSocket(): void {
    this.pagosSocket.escuchar('cargar-pagos').subscribe((resp) => {
      this.obtenerPagos();
    });
  }
}
