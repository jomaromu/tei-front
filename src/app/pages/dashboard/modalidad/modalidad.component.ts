import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from 'src/app/reducers/globarReducers';
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import { ModadlidadService } from '../../../services/modadlidad.service';
import { ModalidadDB, ModalidadPago } from '../../../interfaces/modalidades';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modalidad',
  templateUrl: './modalidad.component.html',
  styleUrls: ['./modalidad.component.scss'],
})
export class ModalidadComponent implements OnInit {
  modalidades: Array<ModalidadDB>;
  modalidad: ModalidadDB;
  forma: FormGroup;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private modalidadService: ModadlidadService,
    private validadores: Validaciones
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarModalidades();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.modalidad.nombre);
    this.forma.controls.estado.setValue(this.modalidad.estado);
  }

  cargarModalidades(): void {
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

          this.modalidadService
            .obtenerModalidades(data)
            .subscribe((modalidades: ModalidadPago) => {
              if (modalidades.ok) {
                this.modalidades = modalidades.modalidadesDB;

                this.store.dispatch(loadingActions.quitarLoading());
              } else {
                Swal.fire(
                  'Mensaje',
                  'Error al cargar las modalidades',
                  'error'
                );
                this.store.dispatch(loadingActions.quitarLoading());
              }

              if (!modalidades) {
                Swal.fire(
                  'Mensaje',
                  'Error al cargar las modalidades',
                  'error'
                );
                this.store.dispatch(loadingActions.quitarLoading());
              }
            });
        }
      });
  }

  showDialog(tipo: string, modalidad?: any) {
    this.modalidad = modalidad;
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
          this.crearModalidad();
          // this.crearMetodoSocket();
        }

        if (tipo === 'editar') {
          this.editarModalidad();
        }
      }
    }
  }

  crearModalidad(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearModalidad = {
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

          this.modalidadService
            .crearModalidadPago(data)
            .subscribe((modalidades: ModalidadPago) => {
              if (modalidades.ok) {
                this.displayDialogCrear = false;
                Swal.fire('Mensaje', 'Modalidad creada', 'success');
                this.cargarModalidades();
                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', `${modalidades?.err?.message}`, 'error');
              }

              if (!modalidades) {
                Swal.fire('Mensaje', 'Error al crear modalidad', 'error');
              }
            });
        }
      });
  }

  editarModalidad(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearModalidad = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            token: usuario.token,
            id: this.modalidad._id,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.modalidadService
            .editarModalidad(data)
            .subscribe((modalidades: ModalidadPago) => {
              if (modalidades.ok) {
                this.displayDialogEditar = false;
                Swal.fire('Mensaje', 'Modalidad editada', 'success');
                this.cargarModalidades();
                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', `${modalidades?.err?.message}`, 'error');
              }

              if (!modalidades) {
                Swal.fire('Mensaje', 'Error al editar modalidad', 'error');
              }
            });
        }
      });
  }

  eliminarModalidad(modalidad: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar esta modalidad?',
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
                id: modalidad._id,
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.modalidadService
                .eliminarModalidad(data)
                .subscribe((modalidades: ModalidadPago) => {
                  if (modalidades.ok) {
                    Swal.fire('Mensaje', 'modalidad borrada', 'success');
                    this.cargarModalidades();
                    this.limpiarFormulario();
                  } else {
                    Swal.fire(
                      'Mensaje',
                      `${modalidades?.err?.message}`,
                      'error'
                    );
                  }

                  if (!modalidades) {
                    Swal.fire('Mensaje', 'Error al borrar modalidad', 'error');
                  }
                });
            }
          });
      }
    });
  }

  ngOnDestroy(): void {}
}

interface CrearModalidad {
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
