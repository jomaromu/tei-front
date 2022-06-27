import {
  Component,
  OnInit,
  AfterContentChecked,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from 'src/app/reducers/globarReducers';
import { CatalogoShared } from '../../interfaces/catalogo-shared';
import { Categoria } from '../../interfaces/categorias';
import { Usuario } from '../../interfaces/resp-worker';
import { CategoriaService } from '../../services/categoria.service';
import * as loadingActions from '../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';
import { Subscription } from 'rxjs';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;

  public catalogo: CatalogoShared;
  forma: FormGroup;

  categorias: Categoria;
  categoria: Categoria;
  tituloBotonHeader = '';
  crear = true;
  objCat: any;
  sub1: Subscription;
  sub2: Subscription;

  constructor(
    private store: Store<AppState>,
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.obtenerCategorias();
    this.crearFormulario();
    this.busqueda();
  }

  ngAfterContentChecked(): void {
    this.catalogo = {
      tipo: 'categorias',
      iconoTituloHeader: 'fas fa-cubes',
      tituloHeader: 'Información Categorías',
      tituloBotonHeader: 'Crear Categoría',
      iconoBotonHeader: 'fas fa-plus',
      tituloTabla: ['#', 'Nombre', 'Estado', 'Controles'],
      tablas: this.categorias?.categoriasDB,
    };
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      estado: [true],
    });
  }

  obtenerCategorias(): void {
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        this.categoriaService
          .obtenerCategorias(worker.token)
          .subscribe((categorias: Categoria) => {
            if (categorias.ok === false) {
              console.log('error');
            } else {
              this.categorias = categorias;
            }
          });
      });
  }

  cerrarCreacion(e: any): void {
    const fondo = this.fondo.nativeElement;
    const wrapCreaciones = this.wrapCreaciones.nativeElement;

    wrapCreaciones.classList.remove('animate__bounceInDown');
    wrapCreaciones.classList.add('animate__bounceOutUp');

    setTimeout(() => {
      fondo.style.display = 'none';
    }, 800);
  }

  cargarDatosCategoria(idCategoria: string, token: string): void {
    this.categoriaService
      .obtenerCategoriaID(idCategoria, token)
      .subscribe((categoria: Categoria) => {
        this.categoria = categoria;

        this.forma.controls.nombre.setValue(this.categoria.categoriaDB.nombre);
        this.forma.controls.estado.setValue(this.categoria.categoriaDB.estado);
      });
  }

  get checkNombre(): boolean {
    if (
      this.forma.controls.nombre.touched &&
      this.forma.controls.nombre.status === 'INVALID'
    ) {
      return true;
    }
  }

  abrirAlert(objCat: any): void {
    const fondo = this.fondo.nativeElement;
    const wrapCreaciones = this.wrapCreaciones.nativeElement;

    wrapCreaciones.classList.remove('animate__bounceOutUp');
    wrapCreaciones.classList.add('animate__bounceInDown');

    this.objCat = objCat;

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        if (objCat.tipo === 'crear') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Crear Categoría';

          this.forma.reset();

          this.crear = true;
        } else if (objCat.tipo === 'editar') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Editar/Ver Categoría';

          this.crear = false;
          this.cargarDatosCategoria(objCat.idCat, worker.token);
        } else if (objCat.tipo === 'eliminar') {
          this.fondo.nativeElement.style.display = 'none';

          Swal.fire({
            title: 'Mensaje',
            text: '¿Desea eliminar esta categoría?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.categoriaService
                .eliminarCategoriaID(objCat.idCat, worker.token)
                .subscribe((categoria: Categoria) => {
                  this.store.dispatch(loadingActions.cargarLoading());

                  if (categoria.ok === true) {
                    this.store.dispatch(loadingActions.quitarLoading());
                    this.obtenerCategorias();

                    if (result.isConfirmed) {
                      Swal.fire('Mensaje', `${categoria.mensaje}`, 'success');
                    }
                  } else {
                    this.store.dispatch(loadingActions.quitarLoading());
                  }
                });
            }
          });
        }
      });
  }

  guardar(): void {
    this.forma.markAllAsTouched();

    if (this.forma.status === 'VALID') {
      // cargar loading
      this.store.dispatch(loadingActions.cargarLoading());

      this.store
        .select('login')
        .pipe(first())
        .subscribe((worker: Usuario) => {
          const estadoSuc = this.forma.controls.estado.value;

          const data: any = {
            nombre: this.forma.controls.nombre.value,
            estado: estadoSuc,
            token: worker.token,
          };

          if (this.objCat.tipo === 'editar') {
            // console.log(data.pais);

            this.categoriaService
              .editarCategoriaID(this.objCat.idCat, worker.token, data)
              .subscribe((categoria: Categoria) => {
                if (categoria.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerCategorias();

                  Swal.fire('Mensaje', `${categoria.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${categoria.mensaje}`, 'error');
                }
              });
          } else if (this.objCat.tipo === 'crear') {
            this.categoriaService
              .crearCategoria(data)
              .subscribe((categoria: Categoria) => {
                if (categoria.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerCategorias();

                  Swal.fire('Mensaje', `${categoria.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';
                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${categoria.mensaje}`, 'error');
                }
              });
          } else {
            return;
          }
        });
    }
  }

  busqueda(): void {
    const ObjBusqueda: ObjBusqueda = {
      criterio: '',
    };
    this.store.dispatch(
      busquedaActions.crearBusqueda({ objBusqueda: ObjBusqueda })
    );

    this.sub2 = this.store
      .select('busqueda')
      .pipe(first())
      .subscribe((worker) => {
        this.store.subscribe((dataRedux) => {
          const token = dataRedux.login.token;
          const criterio = dataRedux.busqueda.criterio;

          const data = {
            token,
            criterio,
          };

          this.categoriaService
            .obtenerCategoriaCriterio(data)
            .subscribe((categorias: Categoria) => {
              // console.log(categorias);
              this.categorias = categorias;
            });
        });
      });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
