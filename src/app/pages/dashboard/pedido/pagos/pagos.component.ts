import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { forkJoin, timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import { MetodoDB, MetodoPago } from 'src/app/interfaces/metodo-pago';
import { ModalidadDB, ModalidadPago } from 'src/app/interfaces/modalidades';
import { Pagos, PagoDB } from '../../../../interfaces/pagos';
import { PedidoDB } from 'src/app/interfaces/pedido';
import { AppState } from 'src/app/reducers/globarReducers';
import { MetodoPagoService } from 'src/app/services/metodo-pago.service';
import { ModadlidadService } from 'src/app/services/modadlidad.service';
import { PagosService } from '../../../../services/pagos.service';
import * as moment from 'moment';
import * as loadingActions from '../../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

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
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private modalidadService: ModadlidadService,
    private metodoService: MetodoPagoService,
    private validadores: Validaciones,
    private pagoService: PagosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarPedido();
    this.crearFormulario();
    this.cargarCatalogos();
    this.obtenerPagos();
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
      .pipe(first())
      .subscribe((usuario) => {
        const obtenerModalidades = this.modalidadService.obtenerModalidades(
          usuario.token
        );

        const obtenerMetodos = this.metodoService.obtenerMetodos(usuario.token);

        forkJoin([obtenerModalidades, obtenerMetodos]).subscribe(
          (resp: [ModalidadPago, MetodoPago]) => {
            if (resp[0].ok && resp[1].ok) {
              this.modalidades = resp[0].modalidadesDB;
              this.metoddos = resp[1].metodosDB;
            }
          }
        );
      });
  }

  obtenerPagos(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe(async (usuario) => {
        this.route.queryParams.subscribe((resp) => {
          const data = {
            token: usuario.token,
            pedido: resp.id,
          };

          this.pagoService
            .obtenerPagosPorPedido(data)
            .subscribe((pagos: Pagos) => {
              if (pagos.ok) {
                this.pagos = pagos.pagosDB;

                // console.log(this.pagos);
              }
            });
        });
      });
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      modalidad: [],
      metodo: [],
      monto: [],
      estado: [true],
    });
  }

  showDialog(tipo: string, pago?: any) {
    this.pago = pago;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
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
    // this.limpiarFormulario();

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
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          creador: usuario.usuarioDB._id,
          modalidad: this.forma.controls.modalidad.value?._id,
          metodo: this.forma.controls.metodo.value?._id,
          fecha: moment().format('DD/MM/YYYY'),
          monto: Number(this.forma.controls.monto.value).toFixed(2),
          // estado: this.forma.controls.estado.value,
          token: usuario.token,
          pedido: this.pedido._id,
        };
        this.pagoService.crearPago(data).subscribe((pagos: Pagos) => {
          this.store.dispatch(loadingActions.cargarLoading());

          if (pagos.ok) {
            this.store.dispatch(loadingActions.quitarLoading());
            this.displayDialogCrear = false;
            Swal.fire('Mensaje', 'Pago creado', 'success');
            this.obtenerPagos();
            // this.limpiarFormulario();
          } else {
            Swal.fire('Mensaje', `Error al crear un pago`, 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!pagos) {
            Swal.fire('Mensaje', 'Error al crear un pago', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
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
      .pipe(first())
      .subscribe((usuario) => {
        const motivo = document.getElementById(
          'motivo-deshabilitar'
        ) as HTMLInputElement;

        const data = {
          token: usuario.token,
          motivo: motivo.value,
          pago: this.pago._id,
          estado: false,
        };

        this.pagoService.editarMotivo(data).subscribe((pago: Pagos) => {
          if (pago.ok) {
            this.modalEstado = false;
            this.obtenerPagos();
          } else {
            Swal.fire('Mensaje', 'Error crear editar el pago', 'error');
          }
        });
      });
  }

  verMotivo(pago: PagoDB): void {
    this.mostrarMotivo = true;
    this.motivo = pago.motivo;
  }
}
