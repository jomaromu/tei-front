import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { OrigenDB, OrigenPedido } from '../../../interfaces/origen-pedido';
import Swal from 'sweetalert2';
import { AppState } from '../../../reducers/globarReducers';
import { OrigenPedidoService } from '../../../services/origen-pedido.service';
import { OrigenSocketService } from '../../../services/sockets/origen-socket.service';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { ValidarTexto, Validaciones } from '../../../classes/validaciones';

@Component({
  selector: 'app-origen-pedido',
  templateUrl: './origen-pedido.component.html',
  styleUrls: ['./origen-pedido.component.scss'],
})
export class OrigenPedidoComponent implements OnInit, OnDestroy {
  origenes: Array<OrigenDB>;
  origen: OrigenDB;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  forma: FormGroup;
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private origenesService: OrigenPedidoService,
    private validadores: Validaciones,
    private origenSocketService: OrigenSocketService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarOrigenes();
    this.crearOrigenesSocket();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.origen.nombre);
    this.forma.controls.estado.setValue(this.origen.estado);
  }

  cargarOrigenes(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.origenesService
          .obtenerOrigenes(usuario.token)
          .subscribe((origenes: OrigenPedido) => {
            this.store.dispatch(loadingActions.cargarLoading());

            if (origenes.ok) {
              this.origenes = origenes.origenesDB;
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!origenes) {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  showDialog(tipo: string, origen?: any) {
    this.origen = origen;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
    } else if (tipo === 'editar') {
      this.cargarFormularioEditar();
      this.displayDialogEditar = true;
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.displayDialogEditar = false;
    this.limpiarFormulario();
  }

  get validarNombre(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: true,
      size: true,
      minSize: 2,
      maxSize: 20,
      value: this.forma.controls.nombre.value,
    });
  }

  limpiarFormulario(): void {
    this.forma.controls.nombre.reset();
  }

  btnGuardar(tipo: string): void {
    if (!this.validarNombre.valido) {
      this.forma.markAllAsTouched();
      return;
    } else {
      if (!tipo) {
        tipo = 'editar';
      } else {
        if (tipo === 'crear') {
          this.crearOrigen();
          this.crearOrigenesSocket();
        }

        if (tipo === 'editar') {
          this.editarOrigen();
        }
      }
    }
  }

  crearOrigen(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearOrigen = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
        };

        this.origenesService
          .crearOrigen(data)
          .subscribe((origen: OrigenPedido) => {
            this.store.dispatch(loadingActions.cargarLoading());

            if (origen.ok) {
              this.store.dispatch(loadingActions.quitarLoading());
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Origen creado', 'success');
              this.cargarOrigenes();
              this.limpiarFormulario();
            } else {
              Swal.fire(
                'Mensaje',
                `Error al crear origen: ${origen.err.message}`,
                'error'
              );
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!origen) {
              Swal.fire('Mensaje', 'Error al crear origen', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  editarOrigen(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearOrigen = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          id: this.origen._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.origenesService
          .editarOrigenID(data)
          .subscribe((origen: OrigenPedido) => {
            if (origen.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Origen editado', 'success');
              this.cargarOrigenes();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', 'Error al editar origen', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!origen) {
              Swal.fire('Mensaje', 'Error al editar origen', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  eliminarOrigen(origen: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar esta origen?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(loadingActions.cargarLoading());

        this.store
          .select('login')
          .pipe(first())
          .subscribe((usuario) => {
            const data = {
              id: origen._id,
              token: usuario.token,
            };

            this.origenesService
              .eliminarOrigenID(data)
              .subscribe((origen: OrigenPedido) => {
                if (origen.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Origen borrado', 'success');
                  this.cargarOrigenes();
                  this.limpiarFormulario();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar origen', 'error');
                }

                if (!origen) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar origen', 'error');
                }
              });
          });
      }
    });
  }

  // sockets
  crearOrigenesSocket(): void {
    this.origenSocketService
      .escuchar('cargar-origenes')
      .subscribe((categorias) => {
        // console.log('ok');
        this.cargarOrigenes();
      });
  }

  ngOnDestroy(): void {
    this.origenSocketService.destruirSocket('cargar-origenes');
  }
}

interface CrearOrigen {
  nombre: string;
  estado: boolean;
  token: string;
  id?: string;
}

/*
1. tener en cuenta lo de los roles
 */

/*
    1. Titulo
    2. CRUD
      2.1 Paginacion
    3. Socket
    4. verificar cuando un dato crucial no se ha enviado o cuando se ha eliminado un id que esta en alguna coleccion
    5. loading
    6. validacion de campos mediante provider
    7. animacion fade
    8. validacion por roles
    9. verificar id socket para que solo se envie a quien corresponde
    10. notificacion desconexion de internet
  */
