import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterContentChecked,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { CatalogoShared } from '../../interfaces/catalogo-shared';
import { AppState } from '../../reducers/globarReducers';
import { OrigenPedidoService } from '../../services/origen-pedido.service';
import Swal from 'sweetalert2';
import * as loadingActions from '../../reducers/loading/loading.actions';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';

import { Usuario } from '../../interfaces/resp-worker';
import { OrigenPedido } from '../../interfaces/origen-pedido';
import { Subscription } from 'rxjs';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';

@Component({
  selector: 'app-origen-pedido',
  templateUrl: './origen-pedido.component.html',
  styleUrls: ['./origen-pedido.component.scss'],
})
export class OrigenPedidoComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;

  public catalogo: CatalogoShared;
  forma: FormGroup;

  origenes: OrigenPedido;
  origen: OrigenPedido;
  tituloBotonHeader = '';
  crear = true;
  objCat: any;
  sub1: Subscription;
  sub2: Subscription;

  constructor(
    private store: Store<AppState>,
    private origenPedidoService: OrigenPedidoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.obtenerOrigen();
    this.crearFormulario();
    this.busqueda();
  }

  ngAfterContentChecked(): void {
    this.catalogo = {
      tipo: 'origen',
      iconoTituloHeader: 'fas fa-people-arrows',
      tituloHeader: 'Origen de Pedidos',
      tituloBotonHeader: 'Crear Origen',
      iconoBotonHeader: 'fas fa-plus',
      tituloTabla: ['#', 'Nombre', 'Estado', 'Controles'],
      tablas: this.origenes?.origenesDB,
    };
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      estado: [true],
    });
  }

  obtenerOrigen(): void {
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        this.origenPedidoService
          .obtenerOrigenes(worker.token)
          .subscribe((origenes: OrigenPedido) => {
            // console.log(origenes);

            if (origenes.ok === false) {
              console.log('error');
            } else {
              this.origenes = origenes;
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

  cargarDatosOrigen(idCategoria: string, token: string): void {
    this.origenPedidoService
      .obtenerOrigenID(idCategoria, token)
      .subscribe((origen: OrigenPedido) => {
        this.origen = origen;

        this.forma.controls.nombre.setValue(this.origen.origenDB.nombre);
        this.forma.controls.estado.setValue(this.origen.origenDB.estado);
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
          this.tituloBotonHeader = 'Crear Origen';

          this.forma.reset();

          this.crear = true;
        } else if (objCat.tipo === 'editar') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Editar/Ver Categoría';

          this.crear = false;
          this.cargarDatosOrigen(objCat.idCat, worker.token);
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
              this.origenPedidoService
                .eliminarOrigenID(objCat.idCat, worker.token)
                .subscribe((origen: OrigenPedido) => {
                  this.store.dispatch(loadingActions.cargarLoading());

                  if (origen.ok === true) {
                    this.store.dispatch(loadingActions.quitarLoading());
                    this.obtenerOrigen();

                    if (result.isConfirmed) {
                      Swal.fire('Mensaje', `${origen.mensaje}`, 'success');
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
            this.origenPedidoService
              .editarOrigenID(this.objCat.idCat, data)
              .subscribe((origen: OrigenPedido) => {
                if (origen.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerOrigen();

                  Swal.fire('Mensaje', `${origen.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${origen.mensaje}`, 'error');
                }
              });
          } else if (this.objCat.tipo === 'crear') {
            this.origenPedidoService
              .crearOrigen(data)
              .subscribe((origen: OrigenPedido) => {
                if (origen.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerOrigen();

                  Swal.fire('Mensaje', `${origen.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';
                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${origen.mensaje}`, 'error');
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

          this.origenPedidoService
            .obtenerOrigenesCriterio(data)
            .subscribe((origenes: OrigenPedido) => {
              // console.log(sucursales);
              this.origenes = origenes;
            });
        });
      });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
