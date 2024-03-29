import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { MetodoPagoService } from '../../../services/metodo-pago.service';
import { AppState } from '../../../reducers/globarReducers';
import Swal from 'sweetalert2';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { MetodoPago, MetodoDB } from '../../../interfaces/metodo-pago';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';
import { MetodoSocketService } from '../../../services/sockets/metodo-socket.service';

@Component({
  selector: 'app-metodos-pago',
  templateUrl: './metodos-pago.component.html',
  styleUrls: ['./metodos-pago.component.scss'],
})
export class MetodosPagoComponent implements OnInit, OnDestroy {
  metodos: Array<MetodoDB>;
  metodo: MetodoDB;
  forma: FormGroup;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private metodoPagoService: MetodoPagoService,
    private validadores: Validaciones,
    // private metodoSocketService: MetodoSocketService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarMetodos();

  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.metodo.nombre);
    this.forma.controls.estado.setValue(this.metodo.estado);
  }

  cargarMetodos(): void {
    this.store.dispatch(loadingActions.cargarLoading());
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
          this.metodoPagoService
            .obtenerMetodos(data)
            .subscribe((metodos: MetodoPago) => {
              if (metodos.ok) {
                this.metodos = metodos.metodosDB;

                this.store.dispatch(loadingActions.quitarLoading());
              } else {
                Swal.fire('Mensaje', 'Error al cargar los métodos', 'error');
                this.store.dispatch(loadingActions.quitarLoading());
              }

              if (!metodos) {
                Swal.fire('Mensaje', 'Error al cargar los métodos', 'error');
                this.store.dispatch(loadingActions.quitarLoading());
              }
            });
        }
      });
  }

  showDialog(tipo: string, metodo?: any) {
    this.metodo = metodo;
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
          this.crearMetodo();

        }

        if (tipo === 'editar') {
          this.editarMetodo();
        }
      }
    }
  }

  crearMetodo(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearMetodo = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.metodoPagoService
            .crearMetodo(data)
            .subscribe((metodo: MetodoPago) => {
              if (metodo.ok) {
                this.displayDialogCrear = false;
                Swal.fire('Mensaje', 'Método creado', 'success');
                this.cargarMetodos();
                this.limpiarFormulario();
              } else {
                Swal.fire(
                  'Mensaje',
                  `Error al crear método: ${metodo.err.message}`,
                  'error'
                );
              }

              if (!metodo) {
                Swal.fire('Mensaje', 'Error al crear métod', 'error');
              }
            });
        }
      });
  }

  editarMetodo(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearMetodo = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            token: usuario.token,
            id: this.metodo._id,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.metodoPagoService
            .editarMetodoID(data)
            .subscribe((metodo: MetodoPago) => {
              if (metodo.ok) {
                this.displayDialogEditar = false;
                Swal.fire('Mensaje', 'Método editado', 'success');
                this.cargarMetodos();
                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', `${metodo.err.message}`, 'error');
              }

              if (!metodo) {
                Swal.fire('Mensaje', 'Error al editar método', 'error');
              }
            });
        }
      });
  }

  eliminarMetodo(metodo: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este método?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // this.store.dispatch(loadingActions.cargarLoading());;

        this.store
          .select('login')
          // .pipe(first())
          .subscribe((usuario) => {
            if (usuario.usuarioDB) {
              const data = {
                id: metodo._id,
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.metodoPagoService
                .eliminarMetodoID(data)
                .subscribe((metodo: MetodoPago) => {
                  if (metodo.ok) {
                    Swal.fire('Mensaje', 'Método borrado', 'success');
                    this.cargarMetodos();
                    this.limpiarFormulario();
                  } else {
                    Swal.fire('Mensaje', `${metodo.err.message}`, 'error');
                  }

                  if (!metodo) {
                    Swal.fire('Mensaje', 'Error al borrar método', 'error');
                  }
                });
            }
          });
      }
    });
  }



  ngOnDestroy(): void {
    // this.metodoSocketService.destruirSocket('cargar-metodos');
  }
}

interface CrearMetodo {
  nombre: string;
  estado: boolean;
  token: string;
  id?: string;
  foranea: string;
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
