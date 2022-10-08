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
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import { PedidoDB } from 'src/app/interfaces/pedido';
import { TipoArchivo, TipoArchivoDB } from 'src/app/interfaces/tipoArchivo';
import { AppState } from 'src/app/reducers/globarReducers';
import { TipoArchivoService } from 'src/app/services/tipo-archivo.service';
import { ArchivosService } from '../../../../services/archivos.service';
import { Archivo, ArchivoDB } from '../../../../interfaces/archivo';
import * as loadingActions from '../../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private tipoArchivoService: TipoArchivoService,
    private validadores: Validaciones,
    private archivoService: ArchivosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarPedido();
    this.obtenerArchivos();
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
      .pipe(first())
      .subscribe((usuario) => {
        this.tipoArchivoService
          .obtenerTiposArchivos(usuario.token)
          .subscribe((tiposArchivos: TipoArchivo) => {
            this.tiposArchivos = tiposArchivos.tiposArchivosDB;
            this.forma.controls.tipo.setValue(this.tiposArchivos[0]?._id);
          });
      });
  }

  obtenerArchivos(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.route.queryParams.subscribe((resp) => {
          const pedido = resp.id;

          const data = {
            pedido,
            token: usuario.token,
          };

          this.archivoService
            .obtenerArchivos(data)
            .subscribe((archivos: Archivo) => {
              if (archivos.ok) {
                this.store.dispatch(loadingActions.quitarLoading());
                this.archivosPedido = archivos.archivosDB;
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
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearArchivo = {
          archivo: this.archivo,
          nombre: this.forma.controls.nombre.value,
          tipo: this.forma.controls.tipo.value,
          pedido: this.pedido._id,
          idCreador: usuario.usuarioDB._id,
          fecha: moment().format('DD/MM/YYYY'),
        };

        const fd: FormData = new FormData();

        fd.append('archivo', data.archivo);
        fd.append('nombre', data.nombre);
        fd.append('tipo', data.tipo);
        fd.append('pedido', data.pedido);
        fd.append('idCreador', data.idCreador);
        fd.append('fecha', data.fecha);

        this.archivoService
          .subirArchivo(fd, usuario.token)
          .subscribe((archivo: Archivo) => {
            if (archivo.ok) {
              this.store.dispatch(loadingActions.quitarLoading());
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Archivo creado', 'success');
              this.obtenerArchivos();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', 'Error al subir archivo', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!archivo) {
              Swal.fire('Mensaje', 'Error al subir archivo', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
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
          .pipe(first())
          .subscribe((usuario) => {
            const nombreArchivo = `${archivoPedido.nombre}.${archivoPedido.ext}`;
            const data = {
              id: archivoPedido._id,
              nombreArchivo,
              token: usuario.token,
            };

            this.archivoService
              .eliminarArchivo(data)
              .subscribe((archivo: Archivo) => {
                if (archivo.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerArchivos();
                  this.limpiarFormulario();
                  Swal.fire('Mensaje', 'Archivo borrado', 'success');
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar el archivo', 'error');
                }

                if (!archivo) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar el archivo', 'error');
                }
              });
          });
      }
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
}
