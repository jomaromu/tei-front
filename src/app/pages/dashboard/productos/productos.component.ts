import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { Producto, ProductoDB } from '../../../interfaces/producto';
import { ProductoService } from '../../../services/producto.service';
import { AppState } from '../../../reducers/globarReducers';
import { ProductoSocketService } from '../../../services/sockets/producto-socket.service';
import { CategoriaSocketService } from '../../../services/sockets/categoria-socket.service';
import Swal from 'sweetalert2';

import * as loadingActions from '../../../reducers/loading/loading.actions';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria, CategoriaDB } from '../../../interfaces/categorias';
import { ValidarTexto, Validaciones } from '../../../classes/validaciones';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent implements OnInit, AfterViewInit, OnDestroy {
  productos: Array<ProductoDB>;
  categorias: Array<CategoriaDB>;
  producto: ProductoDB;
  forma: FormGroup;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;

  constructor(
    private store: Store<AppState>,
    private productosService: ProductoService,
    private categoriaService: CategoriaService,
    private fb: FormBuilder,
    private validadores: Validaciones,
    private productosSocketService: ProductoSocketService,
    private categoriaSocketService: CategoriaSocketService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarProductos();
    this.crearProductoSocket();
    this.crearCategoriaSocket();
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.cargarCategorias();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      categoria: [],
      nombre: [],
      observacion: [],
      precio: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    let mapCategoria = null;
    if (this.producto.categoria) {
      mapCategoria = this.categorias.find(
        (categoria) => categoria._id === this.producto.categoria._id
      );
    }

    this.forma.controls.categoria.setValue(mapCategoria);
    this.forma.controls.nombre.setValue(this.producto.nombre);
    this.forma.controls.observacion.setValue(this.producto.descripcion);
    this.forma.controls.precio.setValue(this.producto.precio);
    this.forma.controls.estado.setValue(this.producto.estado);
  }

  cargarProductos(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.productosService
          .obtenerProductos(usuario.token)
          .subscribe((productos: Producto) => {
            // console.log(productos);

            this.store.dispatch(loadingActions.cargarLoading());

            if (productos.ok) {
              this.productos = productos.productosDB;

              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!productos) {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  showDialog(tipo: string, producto?: any) {
    this.producto = producto;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
      this.cargarCategorias();
    } else if (tipo === 'editar') {
      this.cargarFormularioEditar();
      this.cargarCategorias();
      this.displayDialogEditar = true;
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.displayDialogEditar = false;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.forma.controls.categoria.reset();
    this.forma.controls.nombre.reset();
    this.forma.controls.observacion.reset();
    this.forma.controls.precio.reset();
  }

  cargarCategorias(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const token = usuario.token;
        this.categoriaService
          .obtenerCategorias(token)
          .subscribe((categorias: Categoria) => {
            this.categorias = categorias.categoriasDB;
          });
      });
  }

  get validarCategoria(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.categorias,
      value: this.forma.controls.categoria.value,
    });
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

  get validarObservacion(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      value: this.forma.controls.observacion.value,
    });
  }

  get validarPrecio(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: true,
      size: false,
      value: this.forma.controls.precio.value,
    });
  }

  btnGuardar(tipo: string): void {
    if (
      !this.validarCategoria.valido ||
      !this.validarNombre.valido ||
      !this.validarObservacion.valido ||
      !this.validarPrecio.valido
    ) {
      this.forma.markAllAsTouched();
      return;
    } else {
      // console.log(tipo);
      if (!tipo) {
        tipo = 'editar';
      } else {
        if (tipo === 'crear') {
          this.crearProducto();
          this.crearProductoSocket();
        }

        if (tipo === 'editar') {
          this.editarProducto();
        }
      }
    }
  }

  crearProducto(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearProdcuto = {
          categoria: this.forma.controls.categoria.value._id,
          nombre: this.forma.controls.nombre.value,
          // observacion: this.forma.controls.observacion.value,
          precio: this.forma.controls.precio.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
        };

        this.productosService.crearProducto(data).subscribe((producto: any) => {
          // console.log(producto);
          // return;
          this.store.dispatch(loadingActions.cargarLoading());

          if (producto.ok) {
            this.store.dispatch(loadingActions.quitarLoading());
            this.displayDialogCrear = false;
            Swal.fire('Mensaje', 'Producto creado', 'success');
            // this.cargarProductos();
            this.limpiarFormulario();
          } else {
            Swal.fire(
              'Mensaje',
              `Error al crear un producto: ${producto.mensaje}`,
              'error'
            );
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!producto) {
            Swal.fire('Mensaje', 'Error al crear un producto', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  eliminarProducto(producto: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este producto?',
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
              id: producto._id,
              token: usuario.token,
            };

            this.productosService
              .eliminarProductoID(data)
              .subscribe((producto) => {
                if (producto.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Producto borrado', 'success');
                  this.cargarProductos();
                  this.limpiarFormulario();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar producto', 'error');
                }

                if (!producto) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar producto', 'error');
                }
              });
          });
      }
    });
  }

  editarProducto(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearProdcuto = {
          categoria: this.forma.controls.categoria.value._id,
          nombre: this.forma.controls.nombre.value,
          // observacion: this.forma.controls.observacion.value,
          precio: this.forma.controls.precio.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          id: this.producto._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.productosService
          .editarProductoID(data)
          .subscribe((producto: Producto) => {
            if (producto.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Producto editado', 'success');
              this.cargarProductos();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', 'Error al editar producto', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!producto) {
              Swal.fire('Mensaje', 'Error al editar producto', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  // sockets
  crearProductoSocket(): void {
    this.productosSocketService
      .escuchar('cargar-productos')
      .subscribe((clientes) => {
        this.cargarProductos();
      });
  }

  crearCategoriaSocket(): void {
    this.categoriaSocketService
      .escuchar('cargar-categorias')
      .subscribe((categorias) => {
        this.cargarProductos();
      });
  }

  ngOnDestroy(): void {
    this.productosSocketService.destruirSocket('cargar-productos');
    this.categoriaSocketService.destruirSocket('cargar-categorias');
  }
}

interface CrearProdcuto {
  nombre: string;
  // observacion: string;
  categoria: any;
  estado: boolean;
  precio: number;
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
  */
