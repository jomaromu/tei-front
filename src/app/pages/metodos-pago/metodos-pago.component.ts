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
import { AppState } from '../../reducers/globarReducers';
import { CatalogoShared } from '../../interfaces/catalogo-shared';
import { MetodoPago } from '../../interfaces/metodo-pago';

import { MetodoPagoService } from '../../services/metodo-pago.service';
import { first } from 'rxjs/operators';
import { Usuario } from '../../interfaces/resp-worker';
import Swal from 'sweetalert2';
import * as loadingActions from '../../reducers/loading/loading.actions';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';
import { Subscription } from 'rxjs';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';

@Component({
  selector: 'app-metodos-pago',
  templateUrl: './metodos-pago.component.html',
  styleUrls: ['./metodos-pago.component.scss'],
})
export class MetodosPagoComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;

  public catalogo: CatalogoShared;
  forma: FormGroup;

  metodos: MetodoPago;
  metodo: MetodoPago;
  tituloBotonHeader = '';
  crear = true;
  objCat: any;
  sub1: Subscription;
  sub2: Subscription;

  constructor(
    private store: Store<AppState>,
    private metodoPagoService: MetodoPagoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.obtenerMetodo();
    this.crearFormulario();
    this.busqueda();
  }

  ngAfterContentChecked(): void {
    this.catalogo = {
      tipo: 'metodoPago',
      iconoTituloHeader: 'fas fa-money-bill-wave',
      tituloHeader: 'Método de pago',
      tituloBotonHeader: 'Crear Método',
      iconoBotonHeader: 'fas fa-plus',
      tituloTabla: ['#', 'Nombre', 'Estado', 'Controles'],
      tablas: this.metodos?.metodosDB,
    };
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      estado: [true],
    });
  }

  obtenerMetodo(): void {
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        this.metodoPagoService
          .obtenerMetodos(worker.token)
          .subscribe((metodos: MetodoPago) => {
            // console.log(origenes);

            if (metodos.ok === false) {
              console.log('error');
            } else {
              this.metodos = metodos;
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

  cargarDatosMetodo(idCategoria: string, token: string): void {
    this.metodoPagoService
      .obtenerMetodoID(idCategoria, token)
      .subscribe((metodo: MetodoPago) => {
        this.metodo = metodo;

        this.forma.controls.nombre.setValue(this.metodo.metodoDB.nombre);
        this.forma.controls.estado.setValue(this.metodo.metodoDB.estado);
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
          this.tituloBotonHeader = 'Crear Método';

          this.forma.reset();

          this.crear = true;
        } else if (objCat.tipo === 'editar') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Editar/Ver Método';

          this.crear = false;
          this.cargarDatosMetodo(objCat.idCat, worker.token);
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
              this.metodoPagoService
                .eliminarMetodoID(objCat.idCat, worker.token)
                .subscribe((metodo: MetodoPago) => {
                  this.store.dispatch(loadingActions.cargarLoading());

                  if (metodo.ok === true) {
                    this.store.dispatch(loadingActions.quitarLoading());
                    this.obtenerMetodo();

                    if (result.isConfirmed) {
                      Swal.fire('Mensaje', `${metodo.mensaje}`, 'success');
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
            this.metodoPagoService
              .editarMetodoID(this.objCat.idCat, data)
              .subscribe((metodo: MetodoPago) => {
                if (metodo.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerMetodo();

                  Swal.fire('Mensaje', `${metodo.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${metodo.mensaje}`, 'error');
                }
              });
          } else if (this.objCat.tipo === 'crear') {
            this.metodoPagoService
              .crearMetodo(data)
              .subscribe((metodo: MetodoPago) => {
                if (metodo.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerMetodo();

                  Swal.fire('Mensaje', `${metodo.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';
                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${metodo.mensaje}`, 'error');
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

          this.metodoPagoService
            .obtenerTododsMetodosCriterio(data)
            .subscribe((metodos: MetodoPago) => {
              this.metodos = metodos;
              // console.log(metodos);
            });
        });
      });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
