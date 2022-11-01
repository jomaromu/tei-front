import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../../../reducers/globarReducers';
import Swal from 'sweetalert2';

import { Sucursal, SucursalDB } from '../../../interfaces/sucursales';
import { SucursalService } from '../../../services/sucursal.service';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { SucursalesSocketService } from '../../../services/sockets/sucursales-socket.service';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.scss'],
})
export class SucursalesComponent implements OnInit, AfterViewInit, OnDestroy {
  sucursales: Array<SucursalDB>;
  sucursal: SucursalDB;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  provincias: Array<Provincias> = [];
  checked: boolean = true;

  forma: FormGroup;

  constructor(
    private sService: SucursalService,
    private store: Store<AppState>,
    private http: HttpClient,
    private validadores: Validaciones,
    private fb: FormBuilder,
    private sucursalService: SucursalService
  ) // private sSocketService: SucursalesSocketService
  {}

  ngOnInit(): void {
    this.cargarProvincias();
    this.crearFormulario();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      provincia: [],
      nombre: [],
      telefono: [],
      direccion: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(sucursal?: any): void {
    let mapProvincia = {
      id: '',
      name: '',
    };

    if (!sucursal.provincia) {
      mapProvincia.id = this.provincias[10].id || '';
      mapProvincia.name = this.provincias[10].name || '';
    } else {
      mapProvincia.id = sucursal.provincia.id;
      mapProvincia.name = sucursal.provincia.name;
    }

    this.forma.controls.provincia.setValue(mapProvincia);
    this.forma.controls.nombre.setValue(sucursal.nombre);
    this.forma.controls.telefono.setValue(sucursal.telefono);
    this.forma.controls.direccion.setValue(sucursal.direccion);
    this.forma.controls.estado.setValue(sucursal.estado);
  }

  ngAfterViewInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.store.dispatch(loadingActions.cargarLoading());
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
          this.sService.obtenerSucs(data).subscribe((sucursales: Sucursal) => {
            if (sucursales.ok) {
              this.sucursales = sucursales.sucursalesDB;
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!sucursales) {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  showDialog(tipo: string, sucursal?: any) {
    this.sucursal = sucursal;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
    } else if (tipo === 'editar') {
      this.cargarFormularioEditar(sucursal);
      this.displayDialogEditar = true;
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.displayDialogEditar = false;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.forma.controls.nombre.reset();
    this.forma.controls.telefono.reset();
    this.forma.controls.direccion.reset();
  }

  cargarProvincias(): void {
    this.http
      .get('../assets/provincias.json')
      .subscribe((provincias: Array<Provincias>) => {
        this.provincias = provincias;
        this.forma.controls.provincia.setValue(provincias[10]);
      });
  }

  get validarProvincia(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.provincias,
      value: this.forma.controls.provincia.value,
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

  get validarTelefono(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: false,
      size: false,
      value: this.forma.controls.telefono.value,
    });
  }

  get validarDireccion(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      size: false,
      value: this.forma.controls.direccion.value,
    });
  }

  btnGuardar(tipo: string): void {
    if (
      !this.validarProvincia.valido ||
      !this.validarNombre.valido ||
      !this.validarTelefono.valido ||
      !this.validarDireccion.valido
    ) {
      this.forma.markAllAsTouched();
      return;
    } else {
      if (!tipo) {
        tipo = 'editar';
      } else {
        if (tipo === 'crear') {
          this.crearSucursal();
        }

        if (tipo === 'editar') {
          this.editarSucursal();
        }
      }
    }
  }

  crearSucursal(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        const data: CrearSucursal = {
          provincia: this.forma.controls.provincia.value,
          nombre: this.forma.controls.nombre.value,
          telefono: this.forma.controls.telefono.value,
          direccion: this.forma.controls.direccion.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          foranea: '',
        };

        if (usuario.usuarioDB.empresa) {
          data.foranea = usuario.usuarioDB._id;
        } else {
          data.foranea = usuario.usuarioDB.foranea;
        }

        this.sucursalService
          .crearSucursal(data)
          .subscribe((sucursal: Sucursal) => {
            if (sucursal.ok) {
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Sucursal creada', 'success');
              this.cargarSucursales();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', `${sucursal?.err?.mensaje}`, 'error');
            }

            if (!sucursal) {
              Swal.fire('Mensaje', 'Error crear una sucursal', 'error');
            }

            // console.log(sucursal);
          });
      });
  }

  editarSucursal(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        const data: CrearSucursal = {
          token: usuario.token,
          provincia: this.forma.controls.provincia.value,
          nombre: this.forma.controls.nombre.value,
          telefono: this.forma.controls.telefono.value,
          direccion: this.forma.controls.direccion.value,
          estado: this.forma.controls.estado.value,
          id: this.sucursal._id,
          foranea: '',
        };

        if (usuario.usuarioDB.empresa) {
          data.foranea = usuario.usuarioDB._id;
        } else {
          data.foranea = usuario.usuarioDB.foranea;
        }

        this.sucursalService.editarSucursalID(data).subscribe((sucursal) => {
          if (sucursal.ok) {
            this.cargarSucursales();
            this.limpiarFormulario();
            this.displayDialogEditar = false;
            Swal.fire('Mensaje', `Sucursal editada`, 'success');
          } else {
            Swal.fire('Mensaje', `${sucursal?.err?.mensaje}`, 'error');
          }

          if (!sucursal) {
            Swal.fire('Mensaje', 'Error al editar la sucursal', 'error');
          }
        });
      });
  }

  eliminarSucursal(sucursal: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar esta sucursal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.store
          .select('login')
          // .pipe(first())
          .subscribe((usuario) => {
            if (usuario.usuarioDB) {
              const data = {
                id: sucursal._id,
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.sucursalService
                .eliminarSucursalID(data)
                .subscribe((sucursal) => {
                  if (sucursal.ok) {
                    this.cargarSucursales();
                    this.limpiarFormulario();
                    Swal.fire('Mensaje', 'Sucursal borrada', 'success');
                  } else {
                    Swal.fire('Mensaje', `${sucursal?.err?.mensaje}`, 'error');
                  }

                  if (!sucursal) {
                    Swal.fire(
                      'Mensaje',
                      'Error al borrar la sucursal',
                      'error'
                    );
                  }
                });
            }
          });
      }
    });
  }

  ngOnDestroy(): void {}

  /*
    1. Titulo
    2. CRUD
      2.1 Paginacion
    3. Socket
    4. verificar cuando un dato crucial no se ha enviado
    5. loading
    6. validacion de campos mediante provider
    7. animacion fade
    8. validacion por roles
    9. verificar id socket para que solo se envie a quien corresponde
    10. notificacion desconexion de internet
  */
}

interface Provincias {
  id: string;
  name: string;
}

interface CrearSucursal {
  provincia: Provincias;
  nombre: string;
  telefono: string;
  direccion: string;
  estado: boolean;
  token: string;
  id?: string;
  foranea: string;
}
