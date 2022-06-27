import {
  AfterContentChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs/operators';
import { AppState } from 'src/app/reducers/globarReducers';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { SucursalService } from '../../services/sucursal.service';

import Swal from 'sweetalert2';
import { CatalogoShared } from '../../interfaces/catalogo-shared';
import { Usuario } from '../../interfaces/resp-worker';
import { Sucursal } from '../../interfaces/sucursales';
import * as loadingActions from '../../reducers/loading/loading.actions';
import { SucursalesSocketService } from 'src/app/services/sockets/sucursales-socket.service';
import { Subscription } from 'rxjs';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.scss'],
})
export class SucursalesComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;
  @ViewChild('nombre', { static: true }) nombre: ElementRef<HTMLElement>;

  public catalogo: CatalogoShared;
  sucursales: Sucursal;
  sucursal: Sucursal;
  paises: Array<any>;
  forma: FormGroup;
  crear = true;
  objCat: any;
  tituloBotonHeader = '';
  sub1: Subscription;
  sub2: Subscription;

  constructor(
    private sucursalService: SucursalService,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private http: HttpClient,
    private sucursalSocketService: SucursalesSocketService
  ) {}

  ngOnInit(): void {
    this.obtenerSucursales();
    this.getCountries();
    this.crearFormulario();
    this.busqueda();
    // console.log(this.forma);
  }

  ngAfterContentChecked(): void {
    this.catalogo = {
      tipo: 'sucursales',
      iconoTituloHeader: 'fas fa-laptop-house',
      tituloHeader: 'Información Sucursales',
      tituloBotonHeader: 'Crear Sucursal',
      iconoBotonHeader: 'fas fa-plus',
      tituloTabla: [
        '#',
        'Nombre',
        'Teléfono',
        'F.Creación',
        'Estado',
        'Controles',
      ],
      tablas: this.sucursales?.sucursalesDB,
    };
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      pais: [null],
      telefono: [null],
      ciudad: [null],
      direccion: [null],
      estado: [true],
    });
  }

  obtenerSucursales(): void {
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        this.sucursalService
          .obtenerSucursales(worker.token)
          .subscribe((sucursales: Sucursal) => {
            // console.log(sucursales);

            if (sucursales.ok === false) {
              console.log('error');
            } else {
              this.sucursales = sucursales;
            }
          });
      });
  }

  getCountries(): void {
    this.http
      .get('https://restcountries.com/v3.1/all')
      .pipe(
        map((data: Array<any>) => {
          const todos = data.filter((pais) => {
            // return pais.name.common !== 'Panama';
            return pais.translations.spa.common !== 'Panamá';
          });

          return todos.map((pais) => {
            // return pais.name.common;
            return pais.translations.spa.common;
          });
        })
      )
      .subscribe((paises) => (this.paises = paises.sort()));
  }

  get checkNombre(): boolean {
    if (
      this.forma.controls.nombre.touched &&
      this.forma.controls.nombre.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkTelefono(): boolean {
    if (
      this.forma.controls.telefono.touched &&
      this.forma.controls.telefono.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkCiudad(): boolean {
    if (
      this.forma.controls.ciudad.touched &&
      this.forma.controls.ciudad.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkDireccion(): boolean {
    if (
      this.forma.controls.direccion.touched &&
      this.forma.controls.direccion.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkPais(): boolean {
    if (
      this.forma.controls.pais.touched &&
      this.forma.controls.pais.status === 'INVALID'
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
          this.tituloBotonHeader = 'Crear Sucursal';

          this.forma.reset();
          this.forma.controls.pais.setValue('Panamá');

          this.crear = true;
        } else if (objCat.tipo === 'editar') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Editar/Ver Sucursal';

          this.crear = false;
          this.cargarDatosSucursal(objCat.idCat, worker.token);
        } else if (objCat.tipo === 'eliminar') {
          this.fondo.nativeElement.style.display = 'none';

          Swal.fire({
            title: 'Mensaje',
            text: '¿Desea eliminar esta sucursal?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.sucursalService
                .eliminarSucursalID(objCat.idCat, worker.token)
                .subscribe((sucursal: Sucursal) => {
                  this.store.dispatch(loadingActions.cargarLoading());

                  if (sucursal.ok === true) {
                    this.store.dispatch(loadingActions.quitarLoading());
                    this.obtenerSucursales();

                    if (result.isConfirmed) {
                      Swal.fire('Mensaje', `${sucursal.mensaje}`, 'success');
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

  cargarDatosSucursal(idSucursal: string, token: string): void {
    this.sucursalService
      .obtenerSucursalID(idSucursal, token)
      .subscribe((sucursal: Sucursal) => {
        this.sucursal = sucursal;

        this.forma.controls.nombre.setValue(this.sucursal.sucursalDB.nombre);
        this.forma.controls.pais.setValue(
          this.sucursal.sucursalDB.ubicacion.pais
        );
        this.forma.controls.telefono.setValue(
          this.sucursal.sucursalDB.telefono
        );
        this.forma.controls.ciudad.setValue(
          this.sucursal.sucursalDB.ubicacion.ciudad
        );
        this.forma.controls.direccion.setValue(
          this.sucursal.sucursalDB.ubicacion.direccion
        );
        this.forma.controls.estado.setValue(this.sucursal.sucursalDB.estado);
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
            telefono: this.forma.controls.telefono.value,
            pais: this.forma.controls.pais.value,
            ciudad: this.forma.controls.ciudad.value,
            direccion: this.forma.controls.direccion.value,
            estado: castEstado,
            token: worker.token,
          };

          if (this.objCat.tipo === 'editar') {
            // console.log(data.pais);

            this.sucursalService
              .editarSucursalID(this.objCat.idCat, worker.token, data)
              .subscribe((sucursal: Sucursal) => {
                if (sucursal.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerSucursales();

                  Swal.fire('Mensaje', `${sucursal.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${sucursal.err.message}`, 'error');
                }
              });
          } else if (this.objCat.tipo === 'crear') {
            this.sucursalService
              .crearSucursal(data)
              .subscribe((sucursal: Sucursal) => {
                if (sucursal.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerSucursales();

                  Swal.fire('Mensaje', `${sucursal.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${sucursal.err.message}`, 'error');
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

          this.sucursalService
            .obtenerSucursalCriterio(data)
            .subscribe((sucursales: Sucursal) => {
              // console.log(sucursales);
              this.sucursales = sucursales;
            });
        });
      });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
