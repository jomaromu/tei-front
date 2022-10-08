import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { CategoriaService } from '../../../services/categoria.service';
import { CategoriaSocketService } from '../../../services/sockets/categoria-socket.service';
import { CategoriaDB } from '../../../interfaces/categorias';
import { AppState } from '../../../reducers/globarReducers';
import { Categoria } from '../../../interfaces/categorias';
import Swal from 'sweetalert2';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent implements OnInit, OnDestroy {
  categorias: Array<CategoriaDB>;
  categoria: CategoriaDB;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  forma: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private categoriaService: CategoriaService,
    private validadores: Validaciones,
    private categoriaSocketService: CategoriaSocketService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarCategorias();
    this.crearCategoriaSocket();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.categoria.nombre);
    this.forma.controls.estado.setValue(this.categoria.estado);
  }

  cargarCategorias(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.categoriaService
          .obtenerCategorias(usuario.token)
          .subscribe((categorias: Categoria) => {
            this.store.dispatch(loadingActions.cargarLoading());

            if (categorias.ok) {
              this.categorias = categorias.categoriasDB;
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!categorias) {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  showDialog(tipo: string, categoria?: any) {
    this.categoria = categoria;
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
          this.crearCategoria();
          this.crearCategoriaSocket();
        }

        if (tipo === 'editar') {
          this.editarCategoria();
        }
      }
    }
  }

  crearCategoria(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearCategoria = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
        };

        this.categoriaService
          .crearCategoria(data)
          .subscribe((categoria: any) => {
            this.store.dispatch(loadingActions.cargarLoading());

            if (categoria.ok) {
              this.store.dispatch(loadingActions.quitarLoading());
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Categoría creada', 'success');
              this.cargarCategorias();
              this.limpiarFormulario();
            } else {
              Swal.fire(
                'Mensaje',
                `Error al crear categoría: ${categoria.err.message}`,
                'error'
              );
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!categoria) {
              Swal.fire('Mensaje', 'Error al crear categoría', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  editarCategoria(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearCategoria = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          id: this.categoria._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.categoriaService
          .editarCategoriaID(data)
          .subscribe((categoria: Categoria) => {
            if (categoria.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Categoría editada', 'success');
              this.cargarCategorias();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', 'Error al editar categoría', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!categoria) {
              Swal.fire('Mensaje', 'Error al editar categoría', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  eliminarCategoria(categoria: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar esta categoría?',
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
              id: categoria._id,
              token: usuario.token,
            };

            this.categoriaService
              .eliminarCategoriaID(data)
              .subscribe((categoria: Categoria) => {
                if (categoria.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Categoría borrada', 'success');
                  this.cargarCategorias();
                  this.limpiarFormulario();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar categoría', 'error');
                }

                if (!categoria) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar categoría', 'error');
                }
              });
          });
      }
    });
  }

  // sockets
  crearCategoriaSocket(): void {
    this.categoriaSocketService
      .escuchar('cargar-categorias')
      .subscribe((categorias) => {
        // console.log('ok');
        this.cargarCategorias();
      });
  }

  ngOnDestroy(): void {
    this.categoriaSocketService.destruirSocket('cargar-categorias');
  }
}

interface CrearCategoria {
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
