import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/reducers/globarReducers';
import * as modalActions from '../../reducers/modal/modal.actions';
import { distinct, first } from 'rxjs/operators';
import { ArchivosService } from '../../services/archivos.service';
// import { WebsocketsService } from '../../services/sockets/websockets.service';
import { MetodoPagoService } from '../../services/metodo-pago.service';
import { MetodoPago } from 'src/app/interfaces/metodo-pago';
import Swal from 'sweetalert2';
import validator from 'validator';
import { PagosService } from '../../services/pagos.service';
import * as loadingAction from '../../reducers/loading/loading.actions';
import { Pagos } from '../../interfaces/pagos';
import { CurrencyPipe } from '@angular/common';
import { Usuario } from '../../interfaces/resp-worker';
import { PedidoSocketService } from 'src/app/services/sockets/pedido-socket.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-data',
  templateUrl: './modal-data.component.html',
  styleUrls: ['./modal-data.component.scss'],
})
export class ModalDataComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) modal: ElementRef<HTMLElement>;
  @ViewChild('monto', { static: false }) monto: ElementRef<HTMLInputElement>;

  data: any = {
    data: null,
    tipo: '',
    estado: null,
  };

  archivo: File;
  porcentaje: any;

  tipoArchivos = [
    { nombre: 'Referencia', tipo: 0, default: 'checked' },
    { nombre: 'Aprobado', tipo: 1, default: '' },
    { nombre: 'Impreso', tipo: 2, default: '' },
    { nombre: 'Pagos', tipo: 3, default: '' },
  ];

  modalidad = [
    { id: 0, nombre: 'Abono' },
    { id: 1, nombre: 'Cancelación' },
    // { id: 2, nombre: 'Delivery' },
  ];

  metodos: MetodoPago;
  temp = '';

  // forma: FormGroup;
  formaArchivo: FormGroup;
  formaPagos: FormGroup;
  formaDesactivarPago: FormGroup;
  objDistribucion = [];

  sub1: Subscription;
  sub2: Subscription;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private archivoService: ArchivosService,
    // private wsService: WebsocketsService,
    private pedidoSocketService: PedidoSocketService,
    private metodoPagoService: MetodoPagoService,
    private pagoService: PagosService,
    private currentPipe: CurrencyPipe,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.cargarDataModal();
    this.cargarFormularioArchivo();
    this.cargarFormularioPagos();
    this.cargarFormularioDesacPagos();
    // this.cargarFormulario();
  }

  cargarModal(): void {
    this.sub1 = this.store.select('modal').subscribe((data) => {
      if (data.estado) {
        this.entradaSalidaModal(data.estado);
      } else {
        this.entradaSalidaModal(data.estado);
      }
    });
  }

  cargarDataModal(): void {
    this.store.select('modal').subscribe((resp) => {
      switch (resp.tipo) {
        case 'subir-archivos':
          this.data = resp;
          this.formaArchivo.controls.tipo.setValue(0);
          break;
        case 'ver-diseniadores':
          this.data = resp;
          this.cargarDistribucion();
          break;
        case 'crear-pago':
          this.data = resp;
          this.cargarMetodos();
          // console.log(this.data);
          break;
        case 'estado-pago':
          this.data = resp;
        // default: this.data.tipo = '';
      }
    });

    this.cargarModal();
  }

  cargarDistribucion(): void {
    this.objDistribucion = [];
    const nombres = [];
    const pedidos = [];
    Object.entries(this.data.data.distribucion).forEach((data) => {
      nombres.push(data[0]);
      pedidos.push(data[1]);
    });

    nombres.forEach((nombre, index) => {
      const objFinal = {
        nombre,
        cant: pedidos[index],
      };
      this.objDistribucion.push(objFinal);
    });

    // console.log(this.objDistribucion);
  }

  cerrarModal(): void {
    this.store.dispatch(modalActions.quitarModal());

    this.formaArchivo.controls.archivo.setValue(null);
    this.formaArchivo.controls.archivo.markAsUntouched();
    this.formaArchivo.controls.nombre.setValue(null);

    this.formaDesactivarPago.controls.motivo.reset();
  }

  cargarFormularioArchivo(): void {
    this.formaArchivo = this.fb.group({
      nombre: [null],
      archivo: [null, [Validators.required]],
      tipo: [0, [Validators.required]],
    });
  }

  cargarFormularioPagos(): void {
    this.formaPagos = this.fb.group({
      metodo: [null, [Validators.required]],
      modalidad: [1, [Validators.required]],
      monto: [0, [Validators.required]],
    });
  }

  cargarFormularioDesacPagos(): void {
    this.formaDesactivarPago = this.fb.group({
      motivo: [null, [Validators.required, Validators.minLength(4)]], // REVISAR VALIDACIONES CON ARCHIVO
    });
  }

  // archivos

  get checkArchivo(): boolean {
    if (
      this.formaArchivo.controls.archivo.touched &&
      this.formaArchivo.controls.archivo.status === 'INVALID'
    ) {
      return true;
    }
  }

  cargarArchivo(e: Event): void {
    const file = (e.target as HTMLInputElement).files[0];

    if (file) {
      // this.archivo = file[0];
      // this.forma.controls.archivo.setValue(file[0]);

      // const arrayMime = file.type.split('/');
      // const mime = arrayMime[arrayMime.length - 1];

      const mime = file.type;

      // console.log(file);

      // tslint:disable-next-line: max-line-length
      if (
        mime !== 'text/plain' &&
        mime !== 'image/png' &&
        mime !== 'image/svg+xml' &&
        mime !== 'image/tiff' &&
        mime !== 'image/jpeg' &&
        mime !== 'application/vnd.ms-powerpoint' &&
        mime !==
          'application/vnd.openxmlformats-officedocument.presentationml.presentation' &&
        mime !== 'application/pdf' &&
        mime !== 'application/msword' &&
        mime !==
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        mime !== 'text/pain' &&
        mime !== 'application/vnd.ms-excel' &&
        mime !==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        Swal.fire('Mensaje', 'Archivo no permitido', 'error');

        this.formaArchivo.controls.archivo.setValue(null);
      } else {
        this.archivo = file;
      }
    }
  }

  subirArchivos(): void {
    if (this.formaArchivo.status === 'INVALID') {
      this.formaArchivo.markAllAsTouched();
      return;
    }

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const fd = new FormData();

        fd.append('archivo', this.archivo);
        fd.append('nombre', this.formaArchivo.controls.nombre.value);
        fd.append('tipo', this.formaArchivo.controls.tipo.value);

        this.archivoService
          .subirArchivo(fd, worker.token, this.data.data)
          .subscribe((event) => {
            const divProgres = document.getElementById('divProgres');
            const progress = document.getElementById('progress');
            const btnSubir = document.getElementById('btnSubir');

            if (event.type === HttpEventType.UploadProgress) {
              this.porcentaje = Math.round((event.loaded / event.total) * 100);

              btnSubir.style.cursor = 'no-drop';
              btnSubir.innerText = 'Subiendo...';
              btnSubir.setAttribute('disabled', 'true');

              divProgres.style.display = 'flex';
              progress.style.width = `${this.porcentaje}%`;
            }

            if (event.body) {
              if (event.body.ok === true) {
                Swal.fire('Mensaje', `${event.body.mensaje}`, 'info');

                // this.pedidoSocketService.emitir('cargar-archivos');
                // activo el socket de archivos

                this.archivoService
                  .obtenerArchivosPorPedido(worker.token, this.data.data)
                  .subscribe();
              } else if (event.body.ok === false) {
                Swal.fire('Mensaje', `${event.body.mensaje}`, 'error');
              }

              btnSubir.style.cursor = 'pointer';
              btnSubir.innerText = 'Subir archivo';
              btnSubir.removeAttribute('disabled');

              divProgres.style.display = 'none';
              progress.style.width = `0%`;
              this.formaArchivo.controls.archivo.setValue(null);
              this.formaArchivo.controls.archivo.markAsUntouched();
              this.formaArchivo.controls.nombre.setValue(null);
              this.formaArchivo.controls.tipo.setValue(0);

              this.store.dispatch(modalActions.quitarModal());
            }
          });
      });
  }

  entradaSalidaModal(estado: boolean): void {
    const modal = this.modal.nativeElement;

    if (estado === true) {
      modal.style.display = 'flex';

      modal.classList.remove('animate__fadeOut');
      modal.classList.add('animate__fadeIn');
    } else {
      modal.classList.remove('animate__fadeIn');
      modal.classList.add('animate__fadeOut');

      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }

  // Pagos

  get checkMetodo(): boolean {
    if (
      this.formaPagos.controls.metodo.touched &&
      this.formaPagos.controls.metodo.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkModalidad(): boolean {
    if (
      this.formaPagos.controls.modalidad.touched &&
      this.formaPagos.controls.modalidad.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkMonto(): boolean {
    if (
      this.formaPagos.controls.monto.touched &&
      this.formaPagos.controls.monto.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkMotivo(): boolean {
    if (
      this.formaDesactivarPago.controls.motivo.touched &&
      this.formaDesactivarPago.controls.motivo.status === 'INVALID'
    ) {
      return true;
    }
  }

  crearPago(): void {
    // console.log(this.formaPagos);

    if (this.formaPagos.status === 'INVALID') {
      this.formaPagos.markAllAsTouched();
      return;
    }

    // console.log(Number(this.formaPagos.controls.monto.value));

    // return;
    this.store.dispatch(loadingAction.cargarLoading());

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const data = {
          token: worker.token,
          pedido: this.data.data.pedido,
          metodo: this.formaPagos.controls.metodo.value,
          modalidad: Number(this.formaPagos.controls.modalidad.value),
          monto: Number(this.formaPagos.controls.monto.value),
        };

        Swal.fire({
          title: 'Mensaje',
          text: '¿Desea agregar un pago?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Agregar pago',
          cancelButtonAriaLabel: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.pagoService
              .crearPago(data)
              .pipe(first())
              .subscribe((pago: Pagos) => {
                if (pago.ok === false) {
                  this.store.dispatch(loadingAction.quitarLoading());

                  Swal.fire('Mensaje', `Error al crear el pago`, 'error');
                } else {
                  this.store.dispatch(modalActions.quitarModal());
                  this.store.dispatch(loadingAction.quitarLoading());
                  this.formaPagos.controls.monto.reset();

                  Swal.fire('Mensaje', 'Pago creado', 'success');

                  // Peticion para activar socket
                  this.pedidoService.obtenerPedidos(worker.token).subscribe();

                  // this.wsService.emitir('cargar-pagos');
                  // this.pagoService
                  //   .obtenerPagosPorPedido(data.token, data.pedido)
                  //   .subscribe();
                }
              });
          } else {
            this.store.dispatch(loadingAction.quitarLoading());
          }
        });
      });
  }

  cargarMetodos(): void {
    this.store.pipe(first()).subscribe((reduxTotales) => {
      this.metodoPagoService
        .obtenerMetodos(reduxTotales.login.token)
        .subscribe((metodos: MetodoPago) => {
          // console.log(metodos?.metodosDB[0]._id);
          this.metodos = metodos;
          this.formaPagos.controls.metodo.setValue(metodos.metodosDB[0]._id);
          console.log(this.data.data.monto);
          this.formaPagos.controls.monto.setValue(
            this.currentPipe.transform(this.data.data.monto, '', '', '', '')
          );
        });
    });
  }

  validarMonto(e: Event): void {
    const monto = this.monto.nativeElement;
    const valor = (e.target as HTMLInputElement).value;

    const checkNum = validator.isFloat(valor, { min: 0.0 });

    if (valor === '') {
      this.temp = '';
    }

    if (checkNum) {
      monto.value = valor;
      this.temp = valor;
    } else {
      monto.value = this.temp;
    }
  }

  desactivarPago(): void {
    if (this.formaDesactivarPago.status === 'INVALID') {
      this.formaDesactivarPago.markAllAsTouched();
      return;
    }

    if (!this.data.data.evento) {
      this.store.dispatch(loadingAction.cargarLoading());

      this.store
        .select('login')
        .pipe(first())
        .subscribe((worker) => {
          const desacPago = this.data.data.evento;
          const idPedido = this.data.data.pedido;
          const motivo = this.formaDesactivarPago.controls.motivo.value;
          const idPago = this.data.data.pago;

          const data = {
            motivo,
            desacPago,
            idPedido,
            idPago,
            token: worker.token,
          };

          Swal.fire({
            title: 'Mensaje',
            text: '¿Desea desactivar este pago?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Desactivar pago',
            cancelButtonAriaLabel: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.pagoService
                .desactivarPago(data)
                .pipe(first())
                .subscribe((resp: any) => {
                  if (resp.ok === false) {
                    this.store.dispatch(loadingAction.quitarLoading());

                    Swal.fire(
                      'Mensaje',
                      `Error al desactivar el pago`,
                      'error'
                    );
                  } else {
                    this.store.dispatch(modalActions.quitarModal());
                    this.store.dispatch(loadingAction.quitarLoading());

                    Swal.fire('Mensaje', 'Pago Desactivado', 'success');

                    // Peticion para activar socket
                    this.pedidoService.obtenerPedidos(worker.token).subscribe();

                    // this.wsService.emitir('cargar-pagos');
                    this.pagoService
                      .obtenerPagosPorPedido(data.token, idPedido)
                      .subscribe();
                  }
                });
            } else {
              // this.pedidoSocketService.emitir('cargar-pagos');
              this.store.dispatch(loadingAction.quitarLoading());
            }
          });
        });
    }
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe;
  }
}
