import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from '../../../../classes/validaciones';
import { PedidoDB } from '../../../../interfaces/pedido';
import { TipoArchivo, TipoArchivoDB } from '../../../../interfaces/tipoArchivo';
import { AppState } from '../../../../reducers/globarReducers';
import { TipoArchivoService } from '../../../../services/tipo-archivo.service';
import { ArchivosService } from '../../../../services/archivos.service';
import { Archivo, ArchivoDB } from '../../../../interfaces/archivo';
import * as loadingActions from '../../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { FiltrarEstados } from '../../../../classes/filtrar-estados';
import { ArchivosSocketService } from '../../../../services/sockets/archivos-socket.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-archivos',
  templateUrl: './archivos.component.html',
  styleUrls: ['./archivos.component.scss'],
})
export class ArchivosComponent implements OnInit, OnChanges {
  @Input() pedido: PedidoDB;
  archivosPedido: Array<ArchivoDB> = [];
  archivoPedido: ArchivoDB;
  archivo: File;
  displayDialogCrear: boolean = false;

  tiposArchivos: Array<TipoArchivoDB> = [];
  tipoArchivo: TipoArchivoDB;

  forma: FormGroup;

  myFile: any;

  archivosPermitidos =
    'image/*, application/pdf, application/vnd.ms-powerpoint, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private tipoArchivoService: TipoArchivoService,
    private validadores: Validaciones,
    private archivoService: ArchivosService,
    private route: ActivatedRoute,
    private filtrarEstados: FiltrarEstados,
    private archivosSocket: ArchivosSocketService,
    private breakPointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarPedido();
    this.obtenerArchivos();
    this.mediaQuery();
    this.cargarArchivosSokcet();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cargarPedido();
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
      nombre: [],
      tipo: [],
    });
  }

  limpiarFormulario(): void {
    this.forma.controls.nombre.reset();
    this.forma.controls.tipo.reset();
    this.archivo = null;
  }

  cargarTiposArchivos(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }
          this.tipoArchivoService
            .obtenerTiposArchivos(data)
            .subscribe((tiposArchivos: TipoArchivo) => {
              const tiposArchActivos = this.filtrarEstados.filtrarActivos(
                tiposArchivos.tiposArchivosDB
              );
              this.tiposArchivos = tiposArchActivos;
              this.forma.controls.tipo.setValue(this.tiposArchivos[0]?._id);
            });
        }
      });
  }

  obtenerArchivos(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          this.route.queryParams.subscribe((resp) => {
            const pedido = resp.id;

            const data = {
              pedido,
              token: usuario.token,
              foranea: '',
            };

            if (usuario.usuarioDB.empresa) {
              data.foranea = usuario.usuarioDB._id;
            } else {
              data.foranea = usuario.usuarioDB.foranea;
            }

            this.archivoService
              .obtenerArchivos(data)
              .subscribe((archivos: Archivo) => {
                if (archivos.ok) {
                  this.archivosPedido = archivos.archivosDB;
                  this.store.dispatch(loadingActions.quitarLoading());
                  // console.log(this.archivosPedido);
                } else {
                  Swal.fire('Mensaje', 'Error obtener archivos', 'error');
                  this.store.dispatch(loadingActions.quitarLoading());
                }

                if (!archivos) {
                  Swal.fire('Mensaje', 'Error al obtener archivos', 'error');
                  this.store.dispatch(loadingActions.quitarLoading());
                }
              });
          });
        }
      });
  }

  showDialog(tipo: string, archivo?: any) {
    this.archivo = archivo;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
      this.cargarTiposArchivos();
      this.removeContent();

      // console.log(this.tiposArchivos);
    } else if (tipo === 'editar') {
      // this.cargarFormularioEditar(sucursal);
      // this.displayDialogEditar = true;
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.limpiarFormulario();
  }

  miArchivo(e: Archivos): void {
    this.archivo = e.files[0];
    this.removeContent();
  }

  limpiarArchivo(e: LimpiarArchivo): void {
    this.archivo = null;
  }

  get validarArchivo(): ValidarTexto {
    return this.validadores.validarArchivo(this.archivo);
  }

  get validarNombre(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      size: false,
      minSize: 2,
      maxSize: 20,
      value: this.forma.controls.nombre.value,
    });
  }

  get validarTipoArchivo(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.tiposArchivos,
      value: this.forma.controls.tipo.value,
    });
  }

  btnGuardar(tipo: string): void {
    if (
      !this.validarArchivo.valido ||
      !this.validarNombre.valido ||
      !this.validarTipoArchivo.valido
    ) {
      this.forma.markAllAsTouched();
    } else {
      this.subirArchivo();
    }
  }

  subirArchivo(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearArchivo = {
            archivo: this.archivo,
            nombre: this.forma.controls.nombre.value,
            tipo: this.forma.controls.tipo.value,
            pedido: this.pedido._id,
            idCreador: usuario.usuarioDB._id,
            fecha: moment().format('DD/MM/YYYY'),
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          const fd: FormData = new FormData();

          fd.append('archivo', data.archivo);
          fd.append('nombre', data.nombre);
          fd.append('tipo', data.tipo);
          fd.append('pedido', data.pedido);
          fd.append('idCreador', data.idCreador);
          fd.append('fecha', data.fecha);
          fd.append('foranea', data.foranea);

          this.archivoService
            .subirArchivo(fd, usuario.token)
            .subscribe((archivo: Archivo) => {
              if (archivo.ok) {
                this.displayDialogCrear = false;
                Swal.fire('Mensaje', 'Archivo creado', 'success');
                this.obtenerArchivos();
                this.limpiarFormulario();
                this.store.dispatch(loadingActions.quitarLoading());
              } else {
                Swal.fire('Mensaje', 'Error al subir archivo', 'error');
                this.store.dispatch(loadingActions.quitarLoading());
              }

              if (!archivo) {
                Swal.fire('Mensaje', 'Error al subir archivo', 'error');
                this.store.dispatch(loadingActions.quitarLoading());
              }
            });
        }
      });
  }

  removeContent(): void {
    const time = timer(0, 10).subscribe((resp) => {
      const pContent = document.querySelector('.p-fileupload-files');

      if (pContent) {
        const contFiles = pContent as HTMLElement;

        if (this.validarArchivo.valido) {
          contFiles.style.display = 'block';
          time.unsubscribe();
        } else {
          contFiles.style.display = 'none';
          time.unsubscribe();
        }
      }
    });
  }

  eliminarArchivoPedido(archivoPedido: ArchivoDB): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este archivo?',
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
          // .pipe(first())
          .subscribe((usuario) => {
            if (usuario.usuarioDB) {
              const nombreArchivo = `${archivoPedido.nombre}.${archivoPedido.ext}`;
              const data = {
                id: archivoPedido._id,
                nombreArchivo,
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.archivoService
                .eliminarArchivo(data)
                .subscribe((archivo: Archivo) => {
                  if (archivo.ok) {
                    this.obtenerArchivos();
                    this.limpiarFormulario();
                    Swal.fire('Mensaje', 'Archivo borrado', 'success');
                    this.store.dispatch(loadingActions.quitarLoading());
                  } else {
                    this.store.dispatch(loadingActions.quitarLoading());
                    Swal.fire('Mensaje', 'Error al borrar el archivo', 'error');
                  }

                  if (!archivo) {
                    this.store.dispatch(loadingActions.quitarLoading());
                    Swal.fire('Mensaje', 'Error al borrar el archivo', 'error');
                  }
                });
            }
          });
      }
    });
  }

  mediaQuery(): void {
    this.breakPointObserver
      .observe(['(max-width: 544px)'])
      .subscribe((state: BreakpointState) => {
        const time = timer(0, 300).subscribe((resp) => {
          const fielset = document.querySelector('#wrap-tabla') as HTMLElement;
          const pFieldset4Content = document.querySelector(
            '#p-fieldset-4-content'
          ) as HTMLElement;

          if (fielset && pFieldset4Content) {
            if (state.matches) {
              fielset.style.padding = '0';
              pFieldset4Content.style.padding = '0';
            }
            time.unsubscribe();
          }
        });
      });
  }

  cargarArchivosSokcet(): void {
    this.archivosSocket.escuchar('cargar-archivos').subscribe((resp) => {
      this.obtenerArchivos();
    });
  }
}

interface Archivos {
  files: Array<File>;
}

interface LimpiarArchivo {
  originalEvent: any;
  file: File;
}

interface CrearArchivo {
  _id?: string;
  archivo: File;
  nombre?: string;
  tipo: string;
  pedido: string;
  idCreador: string;
  fecha: string;
  foranea: string;
}
