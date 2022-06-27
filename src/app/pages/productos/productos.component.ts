import {
  Component,
  OnInit,
  AfterContentChecked,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs/operators';
import { AppState } from 'src/app/reducers/globarReducers';
import { CatalogoShared } from '../../interfaces/catalogo-shared';
import { Producto } from '../../interfaces/producto';
import { ProductoService } from '../../services/producto.service';
import { Usuario } from '../../interfaces/resp-worker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as loadingActions from '../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';
import { SucursalService } from '../../services/sucursal.service';
import { forkJoin, Subscription } from 'rxjs';
import { Cliente } from '../../interfaces/clientes';
import { Sucursal } from '../../interfaces/sucursales';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../interfaces/categorias';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;

  public catalogo: CatalogoShared;
  productos: Producto;
  producto: Producto;
  objCat: any;
  tituloBotonHeader = '';
  crear = true;
  sucursales: Sucursal;
  categorias: Categoria;
  sub1: Subscription;
  sub2: Subscription;

  forma: FormGroup;

  constructor(
    private productoService: ProductoService,
    private sucursalService: SucursalService,
    private categoriaService: CategoriaService,
    private store: Store<AppState>,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
    this.crearFormulario();
    this.busqueda();
  }

  ngAfterContentChecked(): void {
    this.catalogo = {
      tipo: 'productos',
      iconoTituloHeader: 'fas fa-box-open',
      tituloHeader: 'Información Productos',
      tituloBotonHeader: 'Crear Producto',
      iconoBotonHeader: 'fas fa-plus',
      tituloTabla: [
        '#',
        'Nombre',
        'Precio',
        'Categoría',
        'Estado',
        'Controles',
      ],
      tablas: this.productos?.productosDB,
    };
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      precio: [null, [Validators.required]],
      descripcion: [null],
      sucursal: [null],
      categoria: [null, [Validators.required]],
      estado: [true],
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

  get checkPrecio(): boolean {
    if (
      this.forma.controls.precio.touched &&
      this.forma.controls.precio.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkDescripcion(): boolean {
    if (
      this.forma.controls.descripcion.touched &&
      this.forma.controls.descripcion.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkSucursal(): boolean {
    if (
      this.forma.controls.sucursal.touched &&
      this.forma.controls.sucursal.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkCategoria(): boolean {
    if (
      this.forma.controls.categoria.touched &&
      this.forma.controls.categoria.status === 'INVALID'
    ) {
      return true;
    }
  }

  obtenerProductos(): void {
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        this.productoService
          .obtenerProductos(worker.token)
          .subscribe((productos: Producto) => {
            // console.log(productos);

            if (productos.ok === false) {
              console.log('error'); // Corregir
            } else {
              this.productos = productos;
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

  abrirAlert(objCat: any): void {
    const fondo = this.fondo.nativeElement;
    const wrapCreaciones = this.wrapCreaciones.nativeElement;

    wrapCreaciones.classList.remove('animate__bounceOutUp');
    wrapCreaciones.classList.add('animate__bounceInDown');

    this.objCat = objCat;

    this.store
      .select('login')
      .pipe(first())
      .subscribe(async (worker: Usuario) => {
        if (objCat.tipo === 'crear') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Creación Producto';

          this.forma.reset();
          this.cargarSelects(worker.token);

          this.crear = true;
        } else if (objCat.tipo === 'editar') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Editar/Ver Producto';

          this.crear = false;
          this.cargarDatosProducto(objCat.idCat, worker.token);
        } else if (objCat.tipo === 'eliminar') {
          this.fondo.nativeElement.style.display = 'none';

          Swal.fire({
            title: 'Mensaje',
            text: '¿Desea eliminar este cliente?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.productoService
                .eliminarProductoID(objCat.idCat, worker.token)
                .subscribe((producto: Producto) => {
                  this.store.dispatch(loadingActions.cargarLoading());

                  if (producto.ok === true) {
                    this.store.dispatch(loadingActions.quitarLoading());
                    this.obtenerProductos();

                    if (result.isConfirmed) {
                      Swal.fire('Mensaje', `${producto.mensaje}`, 'success');
                    }
                  } else {
                    this.store.dispatch(loadingActions.quitarLoading());

                    Swal.fire('Mensaje', `${producto.err}`, 'info');
                  }
                });
            }
          });
        }
      });
  }

  cargarSelects(token: string): void {
    const sucursales = this.sucursalService.obtenerSucursales(token);
    const categorias = this.categoriaService.obtenerCategorias(token);

    forkJoin([sucursales, categorias])
      .pipe(
        map((resp: Array<any>) => {
          const objResp: Clientes = {
            sucursales: resp[0],
            categorias: resp[1],
          };

          return objResp;
        })
      )
      .subscribe((data: Clientes) => {
        // console.log(data);
        this.sucursales = data.sucursales;
        this.categorias = data.categorias;
      });
  }

  cargarDatosProducto(idUsuario: string, token: string): void {
    const sucursales = this.sucursalService.obtenerSucursales(token);
    const categorias = this.categoriaService.obtenerCategorias(token);
    const producto = this.productoService.obtenerProductoID(idUsuario, token);

    forkJoin([sucursales, categorias, producto])
      .pipe(
        map((resp: Array<any>) => {
          const objResp: Clientes = {
            sucursales: resp[0],
            categorias: resp[1],
            producto: resp[2],
          };

          // console.log(objResp);

          return objResp;
        })
      )
      .subscribe((data: Clientes) => {
        // console.log(data);
        this.categorias = data.categorias;
        this.sucursales = data.sucursales;
        this.producto = data.producto;

        this.forma.controls.nombre.setValue(this.producto.productoDB.nombre);
        this.forma.controls.precio.setValue(this.producto.productoDB.precio);
        this.forma.controls.descripcion.setValue(
          this.producto.productoDB.descripcion
        );
        // this.forma.controls.sucursal.setValue(
        //   this.producto.productoDB.sucursal._id
        // );
        this.forma.controls.categoria.setValue(
          this.producto.productoDB.categoria._id
        );
        this.forma.controls.estado.setValue(this.producto.productoDB.estado);
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
          let castEstado = '';

          if (estadoSuc === true) {
            castEstado = 'true';
          } else if (estadoSuc === false) {
            castEstado = 'false';
          }

          const data: any = {
            nombre: this.forma.controls.nombre.value,
            precio: this.forma.controls.precio.value,
            descripcion: this.forma.controls.descripcion.value,
            // sucursal: 'null',
            categoria: this.forma.controls.categoria.value,
            estado: castEstado,
            token: worker.token,
          };

          if (this.objCat.tipo === 'editar') {
            // console.log(data.pais);

            this.productoService
              .editarProductoID(this.objCat.idCat, worker.token, data)
              .subscribe((producto: Producto) => {
                if (producto.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerProductos();

                  Swal.fire('Mensaje', `${producto.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${producto.mensaje}`, 'error');
                }
              });
          } else if (this.objCat.tipo === 'crear') {
            this.productoService
              .crearProducto(data)
              .subscribe((producto: Producto) => {
                if (producto.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerProductos();

                  Swal.fire('Mensaje', `${producto.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${producto.mensaje}`, 'error');
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

    this.sub2 = this.store.subscribe((dataRedux) => {
      const token = dataRedux.login.token;
      const criterio = dataRedux.busqueda.criterio;

      const data = {
        token,
        criterio,
      };

      if (criterio !== '') {
        this.productoService
          .obtenerProductoCriterioNombre(data)
          .subscribe((productos: Producto) => {
            // console.log(productos);
            this.productos = productos;
          });
      } else {
        this.obtenerProductos();
      }
    });
    // });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
interface Clientes {
  sucursales: Sucursal;
  categorias: Categoria;
  producto?: Producto;
}
