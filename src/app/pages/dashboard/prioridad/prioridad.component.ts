import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../reducers/globarReducers';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ValidarTexto, Validaciones } from '../../../classes/validaciones';
import { PrioridadService } from '../../../services/prioridad.service';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import {
  Prioridad,
  PrioridadDB,
  PrioridadOrdenada,
} from '../../../interfaces/prioridad';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { Usuario } from '../../../interfaces/resp-worker';

@Component({
  selector: 'app-prioridad',
  templateUrl: './prioridad.component.html',
  styleUrls: ['./prioridad.component.scss'],
})
export class PrioridadComponent implements OnInit {
  // prioridades: Array<PrioridadDB>;
  prioridadesOrdendas: Array<PrioridadDB>;
  prioridad: PrioridadDB;

  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  displayDialogOrdenar: boolean = false;

  forma: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validadores: Validaciones,
    private store: Store<AppState>,
    private prioridadService: PrioridadService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.ordenarPrioridades();
    // this.cargarPrioridades();
    // this.cargarPrioridadesOrdenadas();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.prioridad.nombre);
    this.forma.controls.estado.setValue(this.prioridad.estado);
  }

  showDialog(tipo: string, prioridad?: any) {
    this.prioridad = prioridad;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
    } else if (tipo === 'editar') {
      this.displayDialogEditar = true;
      this.cargarFormularioEditar();
    } else if (tipo === 'ordenar') {
      this.displayDialogOrdenar = true;
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.displayDialogEditar = false;
    this.displayDialogOrdenar = false;
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
          this.crearPrioridad();
        }

        if (tipo === 'editar') {
          this.editarPrioridad();
        }
      }
    }
  }

  btnEditarOrdenPrioridades(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          colPrioridad: environment.colPrioridad,
          prioridades: this.prioridadesOrdendas,
          token: usuario.token,
        };

        this.prioridadService
          .actualizarPrioriadesOrdenadas(data)
          .subscribe((prioridadOrdenada: PrioridadOrdenada) => {
            if (prioridadOrdenada.ok) {
              this.displayDialogOrdenar = false;
              Swal.fire('Mensaje', 'Prioridades ordenadas', 'success');
            } else {
              this.displayDialogOrdenar = false;
              Swal.fire(
                'Mensaje',
                `Error al crear ordenar las prioridades`,
                'error'
              );
            }
          });
      });
  }

  crearPrioridad(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearPriodad = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
        };

        this.prioridadService
          .crearPrioridad(data)
          .subscribe((prioridad: Prioridad) => {
            this.store.dispatch(loadingActions.cargarLoading());

            if (prioridad.ok) {
              this.store.dispatch(loadingActions.quitarLoading());
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Prioridad creada', 'success');
              this.crudPrioridadesOrdenadas(
                usuario,
                'crear',
                prioridad.prioridadDB
              );
              this.limpiarFormulario();
            } else {
              Swal.fire(
                'Mensaje',
                `Error al crear prioridad: ${prioridad.err.message}`,
                'error'
              );
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!prioridad) {
              Swal.fire('Mensaje', 'Error al crear prioridad', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  editarPrioridad(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearPriodad = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          id: this.prioridad._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.prioridadService
          .editarPrioridad(data)
          .subscribe((prioridad: Prioridad) => {
            if (prioridad.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Prioridad editada', 'success');
              this.crudPrioridadesOrdenadas(usuario, 'editar');
              this.limpiarFormulario();
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al editar prioridad', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!prioridad) {
              Swal.fire('Mensaje', 'Error al editar prioridad', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  eliminarPrioridad(prioridad: PrioridadDB): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar esta prioridad?',
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
              id: prioridad._id,
              token: usuario.token,
            };

            this.prioridadService
              .eliminarPrioridad(data)
              .subscribe((prioridad: Prioridad) => {
                if (prioridad.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Prioridad borrada', 'success');
                  this.crudPrioridadesOrdenadas(usuario, 'eliminar');
                  this.limpiarFormulario();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar prioridad', 'error');
                }

                if (!prioridad) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar prioridad', 'error');
                }
              });
          });
      }
    });
  }

  ordenarPrioridades(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          colPrioridad: environment.colPrioridad,
          token: usuario.token,
        };

        const pet1 = this.prioridadService.obtenerPrioridades(usuario.token);
        const pet2 = this.prioridadService.obtenerPrioridadesOrdenadas(data);

        forkJoin([pet1, pet2]).subscribe((mixPrioridades: Array<any>) => {
          const prioriades: Prioridad = mixPrioridades[0];
          const prioridadesOrdendas: PrioridadOrdenada = mixPrioridades[1];

          if (!prioridadesOrdendas.prioridadesOrdenadaDB) {
            return;
          }

          this.prioridadesOrdendas =
            prioridadesOrdendas.prioridadesOrdenadaDB.prioridades.map(
              (prioridadOriginal, index) =>
                prioriades.prioridadesDB.find((prioridadOrdenada, index2) => {
                  if (prioridadOrdenada) {
                    return prioridadOriginal._id === prioridadOrdenada._id;
                  }
                })
            );
        });
      });
  }

  crudPrioridadesOrdenadas(
    usuario: Usuario,
    tipo: string,
    prioridad?: PrioridadDB
  ): void {
    const data = {
      colPrioridad: environment.colPrioridad,
      token: usuario.token,
    };

    const data2 = {
      colPrioridad: environment.colPrioridad,
      prioridades: this.prioridadesOrdendas,
      token: usuario.token,
    };

    const pet1 = this.prioridadService.obtenerPrioridades(usuario.token);
    const pet2 = this.prioridadService.obtenerPrioridadesOrdenadas(data);

    forkJoin([pet1, pet2]).subscribe((mixPrioridades: Array<any>) => {
      const prioriades: Prioridad = mixPrioridades[0];
      const prioridadesOrdendas: PrioridadOrdenada = mixPrioridades[1];

      if (
        !prioridadesOrdendas.prioridadesOrdenadaDB ||
        prioridadesOrdendas.prioridadesOrdenadaDB.prioridades.length === 0
      ) {
        data2.prioridades = prioriades.prioridadesDB;
        this.prioridadesOrdendas = prioriades.prioridadesDB;
        this.prioridadService.actualizarPrioriadesOrdenadas(data2).subscribe();
        return;
      }

      this.prioridadesOrdendas =
        prioridadesOrdendas.prioridadesOrdenadaDB.prioridades.map(
          (prioridadOriginal, index) =>
            prioriades.prioridadesDB.find((prioridadOrdenada, index2) => {
              return prioridadOriginal._id === prioridadOrdenada._id;
            })
        );

      if (tipo === 'crear') {
        this.prioridadesOrdendas.push(prioridad);
      } else if (tipo === 'eliminar') {
        this.prioridadesOrdendas = this.prioridadesOrdendas.filter(
          (prioridadOrdenada) => prioridadOrdenada !== undefined
        );
      }

      data2.prioridades = this.prioridadesOrdendas;
      this.prioridadService.actualizarPrioriadesOrdenadas(data2).subscribe();
    });
  }
}

interface CrearPriodad {
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
