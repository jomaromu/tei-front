import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import { AppState } from 'src/app/reducers/globarReducers';
import { TipoArchivo, TipoArchivoDB } from '../../../interfaces/tipoArchivo';
import { TipoArchivoService } from '../../../services/tipo-archivo.service';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tipo-archivo',
  templateUrl: './tipo-archivo.component.html',
  styleUrls: ['./tipo-archivo.component.scss'],
})
export class TipoArchivoComponent implements OnInit {
  tiposArchivos: Array<TipoArchivoDB>;
  tipoArchivo: TipoArchivoDB;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  forma: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private tipoArchivoService: TipoArchivoService,
    private validadores: Validaciones
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarTiposArchivos();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.tipoArchivo.nombre);
    this.forma.controls.estado.setValue(this.tipoArchivo.estado);
  }

  cargarTiposArchivos(): void {
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
          this.tipoArchivoService
            .obtenerTiposArchivos(data)
            .subscribe((tiposArchivos: TipoArchivo) => {
              if (tiposArchivos.ok) {
                this.tiposArchivos = tiposArchivos.tiposArchivosDB;
                this.store.dispatch(loadingActions.quitarLoading());
              } else {
                Swal.fire(
                  'Mensaje',
                  'Error al cargar los tipos de archivos',
                  'error'
                );
                this.store.dispatch(loadingActions.quitarLoading());
              }

              if (!tiposArchivos) {
                Swal.fire(
                  'Mensaje',
                  'Error al cargar los tipos de archivos',
                  'error'
                );
                this.store.dispatch(loadingActions.quitarLoading());
              }
            });
        }
      });
  }

  showDialog(tipo: string, tipoArchivo?: any) {
    this.tipoArchivo = tipoArchivo;
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
          this.crearTipoArchivo();
        }

        if (tipo === 'editar') {
          this.editarTipoArchivo();
        }
      }
    }
  }

  crearTipoArchivo(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearTipoArchivo = {
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
          this.tipoArchivoService
            .crearTipoArchivo(data)
            .subscribe((tipoArchivo: TipoArchivo) => {
              if (tipoArchivo.ok) {
                this.displayDialogCrear = false;
                Swal.fire('Mensaje', 'Tipo archivo creado', 'success');
                this.cargarTiposArchivos();
                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', `${tipoArchivo?.err?.message}`, 'error');
              }

              if (!tipoArchivo) {
                Swal.fire('Mensaje', 'Error al crear tipo archivo', 'error');
              }
            });
        }
      });
  }

  editarTipoArchivo(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearTipoArchivo = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            token: usuario.token,
            id: this.tipoArchivo._id,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.tipoArchivoService
            .editarTipoArchivo(data)
            .subscribe((tipoArchivo: TipoArchivo) => {
              if (tipoArchivo.ok) {
                this.displayDialogEditar = false;
                Swal.fire('Mensaje', 'tipo archivo editado', 'success');
                this.cargarTiposArchivos();
                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', `${tipoArchivo?.err?.message}`, 'error');
              }

              if (!tipoArchivo) {
                Swal.fire('Mensaje', 'Error al editar tipo archivo', 'error');
              }
            });
        }
      });
  }

  eliminarTipoArchivo(tipoArchivo: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este tipo de archivo?',
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
                id: tipoArchivo._id,
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.tipoArchivoService
                .eliminarTipoArchivo(data)
                .subscribe((tipoArchivo: TipoArchivo) => {
                  if (tipoArchivo.ok) {
                    Swal.fire('Mensaje', 'tipo archivo borrado', 'success');
                    this.cargarTiposArchivos();
                    this.limpiarFormulario();
                  } else {
                    Swal.fire(
                      'Mensaje',
                      `${tipoArchivo?.err?.message}`,
                      'error'
                    );
                  }

                  if (!tipoArchivo) {
                    Swal.fire(
                      'Mensaje',
                      'Error al borrar tipo archivo',
                      'error'
                    );
                  }
                });
            }
          });
      }
    });
  }

  ngOnDestroy(): void {}
}

interface CrearTipoArchivo {
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
