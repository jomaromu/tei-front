import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterContentChecked,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogoShared } from '../../interfaces/catalogo-shared';
import { Ayuda } from '../../interfaces/ayuda';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/globarReducers';
import { AyudaService } from '../../services/ayuda.service';
import { first } from 'rxjs/operators';
import { Usuario } from '../../interfaces/resp-worker';
import Swal from 'sweetalert2';
import * as loadingActions from '../../reducers/loading/loading.actions';
import * as loginActions from '../../reducers/login/login.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss'],
})
export class AyudaComponent implements OnInit, AfterContentChecked, OnDestroy {
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;

  public catalogo: CatalogoShared;
  forma: FormGroup;

  ayudas: Ayuda;
  ayuda: Ayuda;
  tituloBotonHeader = '';
  crear = true;
  objCat: any;

  // SUBS
  sub1: Subscription;

  constructor(
    private store: Store<AppState>,
    private ayudaService: AyudaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.obtenerAyuda();
    this.crearFormulario();
  }

  ngAfterContentChecked(): void {
    this.catalogo = {
      tipo: 'ayuda',
      iconoTituloHeader: 'fas fa-hands-helping',
      tituloHeader: 'Ayuda',
      tituloBotonHeader: 'Crear Ayuda',
      iconoBotonHeader: 'fas fa-plus',
      tituloTabla: ['#', 'Nombre', 'Estado', 'Controles'],
      tablas: this.ayudas?.ayudasDB,
    };
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      descripcion: [null, [Validators.required]],
      estado: [true],
    });
  }

  obtenerAyuda(): void {
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        this.ayudaService
          .obtenerAyudas(worker.token)
          .subscribe((ayudas: Ayuda) => {
            // console.log(origenes);

            if (ayudas.ok === false) {
              console.log('error');
            } else {
              this.ayudas = ayudas;
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

  cargarDatosAyuda(idCategoria: string, token: string): void {
    this.ayudaService
      .obtenerAyudaID(idCategoria, token)
      .subscribe((ayuda: Ayuda) => {
        this.ayuda = ayuda;

        this.forma.controls.nombre.setValue(this.ayuda.ayudaDB.nombre);
        this.forma.controls.descripcion.setValue(
          this.ayuda.ayudaDB.descripcion
        );
        this.forma.controls.estado.setValue(this.ayuda.ayudaDB.estado);
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

  get checkDescripcion(): boolean {
    if (
      this.forma.controls.descripcion.touched &&
      this.forma.controls.descripcion.status === 'INVALID'
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
          this.tituloBotonHeader = 'Crear Ayuda';

          this.forma.reset();

          this.crear = true;
          this.store.dispatch(
            loginActions.obtenerToken({ token: localStorage.getItem('token') })
          );
        } else if (objCat.tipo === 'editar') {
          fondo.style.display = 'flex';
          this.tituloBotonHeader = 'Editar/Ver Ayuda';

          this.crear = false;
          this.cargarDatosAyuda(objCat.idCat, worker.token);

          this.store.dispatch(
            loginActions.obtenerToken({ token: localStorage.getItem('token') })
          );
        } else if (objCat.tipo === 'eliminar') {
          this.fondo.nativeElement.style.display = 'none';

          Swal.fire({
            title: 'Mensaje',
            text: '¿Desea eliminar esta ayuda?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.ayudaService
                .eliminarAyudaID(objCat.idCat, worker.token)
                .subscribe((ayuda: Ayuda) => {
                  this.store.dispatch(loadingActions.cargarLoading());

                  if (ayuda.ok === true) {
                    this.store.dispatch(loadingActions.quitarLoading());
                    this.obtenerAyuda();

                    if (result.isConfirmed) {
                      Swal.fire('Mensaje', `${ayuda.mensaje}`, 'success');
                    }

                    this.store.dispatch(
                      loginActions.obtenerToken({
                        token: localStorage.getItem('token'),
                      })
                    );
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
            descripcion: this.forma.controls.descripcion.value,
            estado: estadoSuc,
            token: worker.token,
          };

          if (this.objCat.tipo === 'editar') {
            this.ayudaService
              .editarAyudaID(this.objCat.idCat, data)
              .subscribe((ayuda: Ayuda) => {
                if (ayuda.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerAyuda();

                  Swal.fire('Mensaje', `${ayuda.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${ayuda.mensaje}`, 'error');
                }
              });
          } else if (this.objCat.tipo === 'crear') {
            this.ayudaService.crearAyuda(data).subscribe((ayuda: Ayuda) => {
              if (ayuda.ok === true) {
                this.store.dispatch(loadingActions.quitarLoading());
                this.obtenerAyuda();

                Swal.fire('Mensaje', `${ayuda.mensaje}`, 'info');

                this.fondo.nativeElement.style.display = 'none';
                this.forma.reset();
              } else {
                this.store.dispatch(loadingActions.quitarLoading());

                Swal.fire('Mensaje', `${ayuda.mensaje}`, 'error');
              }
            });
          } else {
            return;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
  }
}
