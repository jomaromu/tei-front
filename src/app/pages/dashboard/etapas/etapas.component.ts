import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { EtapasService } from '../../../services/etapas.service';
import { AppState } from '../../../../app/reducers/globarReducers';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { Etapa, EtapaDB, EtapaOrdenada } from '../../../interfaces/etapas';
import { Usuario } from '../../../interfaces/resp-worker';

@Component({
  selector: 'app-etapas',
  templateUrl: './etapas.component.html',
  styleUrls: ['./etapas.component.scss'],
})
export class EtapasComponent implements OnInit {
  etapas: Array<EtapaDB>;
  etapa: EtapaDB;
  etapasOrdenadas: Array<EtapaDB>;

  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  displayDialogOrdenar: boolean = false;

  forma: FormGroup;

  constructor(
    private validadores: Validaciones,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private etapaService: EtapasService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.ordenarEtapas();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.etapa.nombre);
    this.forma.controls.estado.setValue(this.etapa.estado);
  }

  showDialog(tipo: string, etapa?: any) {
    this.etapa = etapa;
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
          this.crearEtapa();
        }

        if (tipo === 'editar') {
          this.editarEtapa();
        }
      }
    }
  }

  btnEditarOrdenEtapas(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            colEtapas: environment.colEtapas,
            etapas: this.etapasOrdenadas,
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.etapaService
            .actualizarEtapasOrdenadas(data)
            .subscribe((etapasOrdenaas: EtapaOrdenada) => {
              if (etapasOrdenaas.ok) {
                this.displayDialogOrdenar = false;
                Swal.fire('Mensaje', 'Etapas ordenadas', 'success');
              } else {
                this.displayDialogOrdenar = false;
                Swal.fire(
                  'Mensaje',
                  `Error al crear ordenar las etapas`,
                  'error'
                );
              }
            });
        }
      });
  }

  crearEtapa(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearEtapa = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.etapaService.crearEtapa(data).subscribe((etapa: Etapa) => {
            if (etapa.ok) {
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Etapa creada', 'success');
              this.crudEtapasOrdenadas(usuario, 'crear', etapa.etapaDB);
              this.limpiarFormulario();
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire(
                'Mensaje',
                `Error al crear etapa: ${etapa.err.message}`,
                'error'
              );
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!etapa) {
              Swal.fire('Mensaje', 'Error al crear etapa', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  editarEtapa(): void {
    // this.store.dispatch(loadingActions.cargarLoading());;
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearEtapa = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            token: usuario.token,
            id: this.etapa._id,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.etapaService.editarEtapa(data).subscribe((etapa: Etapa) => {
            if (etapa.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Etapa editada', 'success');
              this.crudEtapasOrdenadas(usuario, 'editar');
              this.limpiarFormulario();
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', `${etapa.err.message}`, 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!etapa) {
              Swal.fire('Mensaje', 'Error al editar etapa', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  eliminarEtapa(etapa: EtapaDB): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar esta etapa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // this.store.dispatch(loadingActions.cargarLoading());;

        this.store
          .select('login')
          // .pipe(first())
          .subscribe((usuario) => {
            if (usuario.usuarioDB) {
              const data = {
                id: etapa._id,
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.etapaService
                .eliminarEtapa(data)
                .subscribe((etapa: Etapa) => {
                  if (etapa.ok) {
                    Swal.fire('Mensaje', 'Etapa borrada', 'success');
                    this.crudEtapasOrdenadas(usuario, 'eliminar');
                    this.limpiarFormulario();
                    this.store.dispatch(loadingActions.quitarLoading());
                  } else {
                    Swal.fire('Mensaje', `${etapa.err.message}`, 'error');
                    this.store.dispatch(loadingActions.quitarLoading());
                  }

                  if (!etapa) {
                    Swal.fire('Mensaje', 'Error al borrar etapa', 'error');
                    this.store.dispatch(loadingActions.quitarLoading());
                  }
                });
            }
          });
      }
    });
  }

  ordenarEtapas(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            colEtapas: environment.colEtapas,
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          const pet1 = this.etapaService.obtenerEtapas(data);
          const pet2 = this.etapaService.obtenerEtapasOrdenadas(data);

          forkJoin([pet1, pet2]).subscribe((mixEtapas: Array<any>) => {
            const etapas: Etapa = mixEtapas[0];
            const etapasOrdenadas: EtapaOrdenada = mixEtapas[1];

            if (!etapasOrdenadas.etapasOrdenadaDB) {
              return;
            }

            this.etapasOrdenadas = etapasOrdenadas.etapasOrdenadaDB.etapas.map(
              (etapaOriginal, index) =>
                etapas.etapasDB.find((etapaOrdenada, index2) => {
                  if (etapaOrdenada) {
                    return etapaOriginal._id === etapaOrdenada._id;
                  }
                })
            );
          });
        }
      });
  }

  crudEtapasOrdenadas(usuario: Usuario, tipo: string, etapa?: EtapaDB): void {
    const data = {
      colEtapas: environment.colEtapas,
      token: usuario.token,
      foranea: '',
    };

    const data2 = {
      colEtapas: environment.colEtapas,
      etapas: this.etapasOrdenadas,
      token: usuario.token,
      foranea: '',
    };

    if (usuario.usuarioDB.empresa) {
      data.foranea = usuario.usuarioDB._id;
      data2.foranea = usuario.usuarioDB._id;
    } else {
      data.foranea = usuario.usuarioDB.foranea;
      data2.foranea = usuario.usuarioDB.foranea;
    }

    const pet1 = this.etapaService.obtenerEtapas(data);
    const pet2 = this.etapaService.obtenerEtapasOrdenadas(data);

    forkJoin([pet1, pet2]).subscribe((mixEtapas: Array<any>) => {
      const etapas: Etapa = mixEtapas[0];
      const etapasOrdenada: EtapaOrdenada = mixEtapas[1];

      if (
        !etapasOrdenada.etapasOrdenadaDB ||
        etapasOrdenada.etapasOrdenadaDB.etapas.length === 0
      ) {
        data2.etapas = etapas.etapasDB;
        this.etapasOrdenadas = etapas.etapasDB;
        this.etapaService.actualizarEtapasOrdenadas(data2).subscribe();
        return;
      }

      this.etapasOrdenadas = etapasOrdenada.etapasOrdenadaDB.etapas.map(
        (etapaOriginal, index) =>
          etapas.etapasDB.find((etapaOrdenada, index2) => {
            return etapaOriginal._id === etapaOrdenada._id;
          })
      );

      if (tipo === 'crear') {
        this.etapasOrdenadas.push(etapa);
      } else if (tipo === 'eliminar') {
        this.etapasOrdenadas = this.etapasOrdenadas.filter(
          (etapaOrdenada) => etapaOrdenada !== undefined
        );
      }

      data2.etapas = this.etapasOrdenadas;
      this.etapaService.actualizarEtapasOrdenadas(data2).subscribe();
    });
  }
}

interface CrearEtapa {
  nombre: string;
  estado: boolean;
  token: string;
  id?: string;
  foranea: string;
}
