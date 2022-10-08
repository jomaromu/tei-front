import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from '../../../../classes/validaciones';
import { Producto, ProductoDB } from '../../../../interfaces/producto';
import { AppState } from '../../../../reducers/globarReducers';
import { ProductoService } from 'src/app/services/producto.service';
import { ProductoPedidoService } from '../../../../services/producto-pedido.service';
import { PedidoDB } from '../../../../interfaces/pedido';
import {
  ProductoPedido,
  ProductoPedidoDB,
} from '../../../../interfaces/producto-pedido';
import Swal from 'sweetalert2';
import * as loadingActions from '../../../../reducers/loading/loading.actions';
import { CalculosProductosPedidos } from 'src/app/classes/calculos-productos-pedidos';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent implements OnInit, OnChanges {
  @Input() pedido: PedidoDB;
  totales = {
    subtotal: 0,
    itbms: 0,
    total: 0,
  };
  forma: FormGroup;
  productos: Array<ProductoDB>;
  productosPedidos: Array<ProductoPedidoDB>;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private productoService: ProductoService,
    private validadores: Validaciones,
    private productoPedSer: ProductoPedidoService,
    private calculosService: CalculosProductosPedidos
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarPedido();
    this.cargarProductosPedidos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cargarProductosPedidos();
  }

  cargarPedido(): void {
    const time = timer(0, 1000).subscribe((resp) => {
      // console.log(this.pedido);

      if (this.pedido) {
        time.unsubscribe();
      }

      if (resp > 10) {
        time.unsubscribe();
      }
    });
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      producto: [],
      cantidad: [1],
      precio: [0],
      itbms: [false],
    });
  }

  cargarProductosPedidos(): void {
    this.store
      .select('login')
      // .pipe(take(4))
      .subscribe((usuario) => {
        // console.log(this.pedido);
        if (this.pedido) {
          const data = {
            pedido: this.pedido._id,
            token: usuario.token,
          };

          this.productoPedSer
            .obtenerProductosPedidos(data)
            .pipe(first())
            .subscribe((productosPedidos: ProductoPedido) => {
              const prodPedidos = this.calculosService.calcularCostos(
                productosPedidos.productosPedidos
              );

              this.productosPedidos = prodPedidos;

              this.totales = [
                ...new Set(
                  this.calculosService.calcularTotales(this.productosPedidos)
                ),
              ][0];
            });
        }
      });
  }

  buscarProductos(e: Event): void {
    const criterio = (e.target as HTMLInputElement).value;

    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          criterio,
          token: usuario.token,
        };
        this.productoService
          .obtenerProductoCriterio(data)
          .subscribe((productos: Producto) => {
            this.productos = productos.productosDB;
          });
      });
  }

  setProducto(): void {
    const producto: ProductoDB = this.forma.controls.producto.value;

    if (producto) {
      this.forma.controls.precio.setValue(producto.precio);
    }

    this.invalidPDropDown(this.validarProducto.valido);
  }

  get validarProducto(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.productos,
      value: this.forma.controls.producto.value,
    });
  }

  get validarCantidad(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: true,
      size: true,
      minSize: 1,
      maxSize: 8,
      value: this.forma.controls.cantidad.value,
    });
  }

  get validarPrecio(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: true,
      size: true,
      minSize: 1,
      maxSize: 8,
      value: this.forma.controls.precio.value,
    });
  }

  btnAgregarProducto(): void {
    this.invalidPDropDown(this.forma.controls.producto.value);
    if (
      !this.validarProducto.valido ||
      !this.validarCantidad.valido ||
      !this.validarPrecio.valido
    ) {
      this.forma.markAllAsTouched();

      return;
    } else {
      this.crearProductoPedido();
    }
  }

  crearProductoPedido(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          token: usuario.token,
          producto: this.forma.controls.producto.value._id,
          cantidad: Number(this.forma.controls.cantidad.value),
          precio: Number(this.forma.controls.precio.value),
          itbms: Boolean(this.forma.controls.itbms.value),
          pedido: this.pedido._id,
        };
        this.store.dispatch(loadingActions.cargarLoading());
        this.productoPedSer
          .crearProductoPedido(data)
          .subscribe((productoPedido: ProductoPedido) => {
            if (productoPedido.ok) {
              // Swal.fire('Mensaje', 'Producto pedido creado', 'success');
              this.store.dispatch(loadingActions.quitarLoading());
              this.cargarProductosPedidos();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', 'Error al crear producto pedido', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!productoPedido) {
              Swal.fire(
                'Mensaje',
                'Error al Error al crear producto pedido',
                'error'
              );
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  limpiarFormulario(): void {
    this.forma.controls.producto.reset();
    this.forma.controls.cantidad.setValue(1);
    this.forma.controls.precio.setValue(0);
    this.forma.controls.itbms.setValue(false);
  }

  eliminarProductoPedido(id: string): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar producto?',
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
              token: usuario.token,
              id,
            };
            this.store.dispatch(loadingActions.cargarLoading());
            this.productoPedSer
              .eliminarProductoPedido(data)
              .subscribe((productoPedido: ProductoPedido) => {
                if (productoPedido.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Producto pedido borrado', 'success');
                  this.cargarProductosPedidos();
                } else {
                  Swal.fire(
                    'Mensaje',
                    'Error al borrar producto pedido',
                    'error'
                  );
                  this.store.dispatch(loadingActions.quitarLoading());
                }

                if (!productoPedido) {
                  Swal.fire(
                    'Mensaje',
                    'Error al Error al borrar producto pedido',
                    'error'
                  );
                  this.store.dispatch(loadingActions.quitarLoading());
                }
              });
          });
      }
    });
  }

  invalidPDropDown(valido: boolean): void {
    const pDropDown = document.querySelector('#p-dropdown div') as HTMLElement;

    if (valido) {
      pDropDown.style.border = '1px solid #ced4da';
    } else {
      pDropDown.style.border = '1px solid red';
    }
  }
}
