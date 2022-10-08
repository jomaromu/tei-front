import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AppState } from '../../../reducers/globarReducers';
import { ColorService } from '../../../services/color.service';
import { ColorSocketService } from '../../../services/sockets/color-socket.service';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { Colores, ColorDB } from '../../../interfaces/colores';

@Component({
  selector: 'app-colores',
  templateUrl: './colores.component.html',
  styleUrls: ['./colores.component.scss'],
})
export class ColoresComponent implements OnInit, OnDestroy {
  colores: Array<ColorDB>;
  color: ColorDB;
  forma: FormGroup;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;

  constructor(
    private fb: FormBuilder,
    private validadores: Validaciones,
    private store: Store<AppState>,
    private colorService: ColorService,
    private colorSocketService: ColorSocketService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarColores();
    this.crearColoresSocket();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      color: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.color.nombre);
    this.forma.controls.color.setValue(this.color.color);
    this.forma.controls.estado.setValue(this.color.estado);
  }

  cargarColores(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.colorService
          .obtenerColores(usuario.token)
          .subscribe((colores: Colores) => {
            this.store.dispatch(loadingActions.cargarLoading());

            if (colores.ok) {
              this.colores = colores.coloresDB;
              // console.log(colores);

              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar colores', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!colores) {
              Swal.fire('Mensaje', 'Error al cargar colores', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  showDialog(tipo: string, color?: any) {
    this.color = color;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
      this.forma.controls.color.setValue('#1c1aa1');
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

  limpiarFormulario(): void {
    this.forma.controls.nombre.reset();
    this.forma.controls.color.reset();
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

  btnGuardar(tipo: string): void {
    if (!this.validarNombre.valido) {
      this.forma.markAllAsTouched();
      return;
    } else {
      if (!tipo) {
        tipo = 'editar';
      } else {
        if (tipo === 'crear') {
          this.crearColor();
          this.crearColoresSocket();
        }

        if (tipo === 'editar') {
          this.editarColor();
        }
      }
    }
  }

  crearColor(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearColor = {
          nombre: this.forma.controls.nombre.value,
          color: this.forma.controls.color.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
        };

        this.colorService.crearColor(data).subscribe((color: Colores) => {
          // return;
          this.store.dispatch(loadingActions.cargarLoading());

          if (color.ok) {
            this.store.dispatch(loadingActions.quitarLoading());
            this.displayDialogCrear = false;
            Swal.fire('Mensaje', 'Color creado', 'success');
            this.cargarColores();
            this.limpiarFormulario();
          } else {
            Swal.fire(
              'Mensaje',
              `Error al crear un color: ${color.mensaje}`,
              'error'
            );
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!color) {
            Swal.fire('Mensaje', 'Error al crear un color', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  editarColor(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearColor = {
          nombre: this.forma.controls.nombre.value,
          color: this.forma.controls.color.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          id: this.color._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.colorService.editarColor(data).subscribe((color: Colores) => {
          if (color.ok) {
            this.displayDialogEditar = false;
            Swal.fire('Mensaje', 'Color editado', 'success');
            this.cargarColores();
            this.limpiarFormulario();
          } else {
            Swal.fire('Mensaje', 'Error al editar color', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!color) {
            Swal.fire('Mensaje', 'Error al editar color', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  eliminarColor(color: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este Color?',
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
              id: color._id,
              token: usuario.token,
            };

            this.colorService
              .eliminarColor(data)
              .subscribe((color: Colores) => {
                if (color.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Color borrado', 'success');
                  this.cargarColores();
                  this.limpiarFormulario();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar color', 'error');
                }

                if (!color) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar color', 'error');
                }
              });
          });
      }
    });
  }

  // sockets
  crearColoresSocket(): void {
    this.colorSocketService.escuchar('cargar-colores').subscribe((clientes) => {
      this.cargarColores();
    });
  }

  ngOnDestroy(): void {
    this.colorSocketService.destruirSocket('cargar-colores');
  }
}

interface CrearColor {
  nombre: string;
  estado: boolean;
  color: string;
  token: string;
  id?: any;
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
    11. verificar mensjes de error desde el backend
  */
