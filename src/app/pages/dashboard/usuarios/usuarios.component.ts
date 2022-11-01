import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { Usuario, UsuarioWorker } from '../../../interfaces/resp-worker';
import { Sucursal, SucursalDB } from '../../../interfaces/sucursales';
import { Role, Roles } from '../../../interfaces/roleWorker';
import Swal from 'sweetalert2';
import { AppState } from '../../../../app/reducers/globarReducers';
import { UserService } from '../../../../app/services/user.service';
import { SucursalService } from '../../../services/sucursal.service';
import { RoleWorkerService } from '../../../services/role-worker.service';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';
import { FiltrarEstados } from '../../../classes/filtrar-estados';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit, OnDestroy {
  colaboradores: Array<UsuarioWorker>;
  colaborador: UsuarioWorker;
  sucursales: Array<SucursalDB>;
  roles: Array<Role>;
  forma: FormGroup;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;

  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private fb: FormBuilder,
    private sService: SucursalService,
    private rolesService: RoleWorkerService,
    private validadores: Validaciones,
    private filtrarEstados: FiltrarEstados
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarUsuarios();
    this.cargarSucursales();
    this.cargarRoles();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      sucursales: [],
      roles: [],
      nombre: [],
      apellido: [],
      identificacion: [],
      correo: [],
      telefono: [],
      estado: [true],
    });
  }

  cargarUsuarios(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            foranea: '',
            token: usuario.token,
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.userService
            .obtenerUsuarios(data)
            .subscribe((colaboradores: Usuario) => {
              // console.log(colaboradores);

              if (colaboradores.ok) {
                this.colaboradores = colaboradores.usuariosDB;
                this.store.dispatch(loadingActions.quitarLoading());
              } else {
                Swal.fire('Mensaje', `${colaboradores?.err?.mensaje}`, 'error');
                this.store.dispatch(loadingActions.quitarLoading());
              }

              if (!colaboradores) {
                Swal.fire(
                  'Mensaje',
                  'Error al cargar los colaboradors',
                  'error'
                );
                this.store.dispatch(loadingActions.quitarLoading());
              }
            });
        }
      });
  }

  cargarFormularioEditar(): void {
    let mapSucursal = null;
    let mapRole = null;
    if (this.colaborador.sucursal !== null) {
      mapSucursal = this.sucursales.find(
        (sucursal) => sucursal._id === this.colaborador?.sucursal?._id
      );
    }
    if (this.colaborador.role !== null) {
      mapRole = this.roles.find(
        (role) => role._id === this.colaborador?.role?._id
      );
    }

    this.forma.controls.sucursales.setValue(mapSucursal);
    this.forma.controls.roles.setValue(mapRole);
    this.forma.controls.nombre.setValue(this.colaborador.nombre);
    this.forma.controls.apellido.setValue(this.colaborador.apellido);
    this.forma.controls.identificacion.setValue(
      this.colaborador.identificacion
    );
    this.forma.controls.correo.setValue(this.colaborador.correo);
    this.forma.controls.telefono.setValue(this.colaborador.telefono);
    this.forma.controls.estado.setValue(this.colaborador.estado);
  }

  limpiarFormulario(): void {
    this.forma.controls.sucursales.reset();
    this.forma.controls.roles.reset();
    this.forma.controls.nombre.reset();
    this.forma.controls.apellido.reset();
    this.forma.controls.identificacion.reset();
    this.forma.controls.correo.reset();
    this.forma.controls.telefono.reset();
    this.forma.controls.estado.setValue(true);
  }

  cargarRoles(): void {
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

          this.rolesService.obtenerRoles(data).subscribe((roles: Roles) => {
            // this.store.dispatch(loadingActions.cargarLoading());
            const rolesActivos = this.filtrarEstados.filtrarActivos(
              roles.rolesDB
            );

            if (roles.ok) {
              this.roles = rolesActivos;
              // this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar los roles', 'error');
              // this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!roles) {
              Swal.fire('Mensaje', 'Error al cargar los roles', 'error');
              // this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  cargarSucursales(): void {
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
            const sucActivas = this.filtrarEstados.filtrarActivos(
              sucursales.sucursalesDB
            );
            // this.store.dispatch(loadingActions.cargarLoading());

            if (sucursales.ok) {
              this.sucursales = sucActivas;
              // this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              // this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!sucursales) {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              // this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  showDialog(tipo: string, colaborador?: UsuarioWorker) {
    this.cargarSucursales();
    this.cargarRoles();
    this.colaborador = colaborador;

    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
    } else if (tipo === 'editar') {
      this.cargarFormularioEditar();
      this.displayDialogEditar = true;
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.displayDialogEditar = false;
    this.limpiarFormulario();
  }

  get validarSucursal(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.sucursales,
      value: this.forma.controls.sucursales.value,
    });
  }

  get validarRole(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.roles,
      value: this.forma.controls.roles.value,
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

  get validarApellido(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: true,
      size: true,
      minSize: 2,
      maxSize: 20,
      value: this.forma.controls.apellido.value,
    });
  }

  get validarIdentificacion(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      size: false,
      minSize: 2,
      maxSize: 20,
      value: this.forma.controls.identificacion.value,
    });
  }

  get validarCorreo(): ValidarTexto {
    return this.validadores.validarCorreo({
      requerido: true,
      value: this.forma.controls.correo.value,
    });
  }

  get validarTelefono(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: false,
      size: false,
      value: this.forma.controls.telefono.value,
    });
  }

  btnGuardar(tipo: string): void {
    // console.log(this.forma.controls.sucursales.value);
    if (
      !this.validarSucursal.valido ||
      !this.validarRole.valido ||
      !this.validarNombre.valido ||
      !this.validarApellido.valido ||
      !this.validarIdentificacion.valido ||
      !this.validarCorreo.valido ||
      !this.validarTelefono.valido
    ) {
      this.forma.markAllAsTouched();
      return;
    } else {
      // console.log(tipo);
      if (!tipo) {
        tipo = 'editar';
      } else {
        if (tipo === 'crear') {
          this.crearColaborador();
          // this.crearClienteSocket();
        }

        if (tipo === 'editar') {
          this.editarColaborador();
        }
      }
    }
  }

  crearColaborador(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearColaborador = {
            sucursal: this.forma.controls.sucursales.value._id,
            role: this.forma.controls.roles.value._id,
            nombre: this.forma.controls.nombre.value,
            apellido: this.forma.controls.apellido.value,
            identificacion: this.forma.controls.identificacion.value,
            telefono: this.forma.controls.telefono.value,
            correo: this.forma.controls.correo.value,
            estado: this.forma.controls.estado.value,
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.userService
            .crearUsuario(data)
            .subscribe((colaborador: Usuario) => {
              if (colaborador.ok) {
                this.displayDialogCrear = false;
                Swal.fire(
                  'Mensaje',
                  'Colaborador creado, el password es: 12345678',
                  'success'
                );
                this.cargarUsuarios();
                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', `${colaborador?.err?.mensaje}`, 'error');
              }

              if (!colaborador) {
                Swal.fire('Mensaje', 'Error al crear un colaborador', 'error');
              }
            });
        }
      });
  }

  editarColaborador(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearColaborador = {
          sucursal: this.forma.controls.sucursales.value._id,
          role: this.forma.controls.roles.value._id,
          nombre: this.forma.controls.nombre.value,
          apellido: this.forma.controls.apellido.value,
          identificacion: this.forma.controls.identificacion.value,
          telefono: this.forma.controls.telefono.value,
          correo: this.forma.controls.correo.value,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          id: this.colaborador._id,
          foranea: '',
        };

        if (usuario.usuarioDB.empresa) {
          data.foranea = usuario.usuarioDB._id;
        } else {
          data.foranea = usuario.usuarioDB.foranea;
        }

        this.userService
          .editarUsuario(data)
          .subscribe((colaborador: Usuario) => {
            if (colaborador.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Colaborador editado', 'success');
              this.cargarUsuarios();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', `${colaborador?.err?.mensaje}`, 'error');
            }

            if (!colaborador) {
              Swal.fire('Mensaje', 'Error al editar colaborador', 'error');
            }
          });
      });
  }

  eliminarColaborador(colaborador: UsuarioWorker): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este colaborador?',
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
          .pipe(first())
          .subscribe((usuario) => {
            const data = {
              id: colaborador._id,
              token: usuario.token,
              foranea: '',
            };

            if (usuario.usuarioDB.empresa) {
              data.foranea = usuario.usuarioDB._id;
            } else {
              data.foranea = usuario.usuarioDB.foranea;
            }

            this.userService
              .eliminarUsuario(data)
              .subscribe((colaborador: Usuario) => {
                if (colaborador.ok) {
                  Swal.fire('Mensaje', 'Colaborador borrado', 'success');
                  this.cargarUsuarios();
                  this.limpiarFormulario();
                } else {
                  Swal.fire('Mensaje', `${colaborador.err.mensaje}`, 'error');
                }

                if (!colaborador) {
                  Swal.fire('Mensaje', 'Error al borrar colaborador', 'error');
                }
              });
          });
      }
    });
  }

  ngOnDestroy(): void {}
}

interface CrearColaborador {
  sucursal: string;
  role: string;
  nombre: string;
  apellido: string;
  identificacion: string;
  correo: string;
  telefono: string;
  estado: boolean;
  token: string;
  id?: string;
  foranea?: string;
}
