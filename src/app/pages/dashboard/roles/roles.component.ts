import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from '../../../../app/reducers/globarReducers';
import { RoleWorkerService } from '../../../services/role-worker.service';
import {
  Restricciones,
  Role,
  Roles,
} from '../../../../app/interfaces/roleWorker';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';
import * as loadingActions from '../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  roles: Array<Role>;
  role: Role;
  restricciones: Restricciones;

  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  displayDialogRestriccion: boolean = false;

  forma: FormGroup;
  formaRestricciones: FormGroup;
  constructor(
    private validadores: Validaciones,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private roleWorkerService: RoleWorkerService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.crearFormularioRestricciones();
    this.cargarRoles();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [],
      estado: [true],
      vendedor: [false],
      diseniador: [false],
    });
  }

  crearFormularioRestricciones(): void {
    this.formaRestricciones = this.fb.group({
      catalogo: [],
      sucursales: [],
      colaboradores: [],
      clientes: [],
      categorias: [],
      productos: [],
      roles: [],
      origen: [],
      prioridad: [],
      etapas: [],
      colores: [],
      metodos: [],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.role.nombre);
    this.forma.controls.estado.setValue(this.role.estado);
    this.forma.controls.vendedor.setValue(this.role.vendedor);
    this.forma.controls.diseniador.setValue(this.role.diseniador);
  }

  cargarFormularioEditarRestricciones(): void {
    this.formaRestricciones.controls.catalogo.setValue(
      this.role.restricciones.sidebar.catalogo
    );
    this.formaRestricciones.controls.colaboradores.setValue(
      this.role.restricciones.sidebar.colaboradores
    );
    this.formaRestricciones.controls.categorias.setValue(
      this.role.restricciones.sidebar.categorias
    );
    this.formaRestricciones.controls.roles.setValue(
      this.role.restricciones.sidebar.roles
    );
    this.formaRestricciones.controls.prioridad.setValue(
      this.role.restricciones.sidebar.prioridad
    );
    this.formaRestricciones.controls.colores.setValue(
      this.role.restricciones.sidebar.colores
    );
    this.formaRestricciones.controls.sucursales.setValue(
      this.role.restricciones.sidebar.sucursales
    );
    this.formaRestricciones.controls.clientes.setValue(
      this.role.restricciones.sidebar.clientes
    );
    this.formaRestricciones.controls.productos.setValue(
      this.role.restricciones.sidebar.productos
    );
    this.formaRestricciones.controls.origen.setValue(
      this.role.restricciones.sidebar.origen
    );
    this.formaRestricciones.controls.etapas.setValue(
      this.role.restricciones.sidebar.etapas
    );
    this.formaRestricciones.controls.metodos.setValue(
      this.role.restricciones.sidebar.metodos
    );
  }

  cargarRoles(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.roleWorkerService
          .obtenerRoles(usuario.token)
          .subscribe((roles: Roles) => {
            this.store.dispatch(loadingActions.cargarLoading());

            if (roles.ok) {
              this.roles = roles.rolesDB;
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar los roles', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!roles) {
              Swal.fire('Mensaje', 'Error al cargar los roles', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  showDialog(tipo: string, role?: any) {
    this.role = role;
    if (!tipo) {
      tipo = 'crear';
    }

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
    } else if (tipo === 'editar') {
      this.cargarFormularioEditar();
      this.displayDialogEditar = true;
    } else if (tipo === 'restricciones') {
      this.displayDialogRestriccion = true;
      this.cargarFormularioEditarRestricciones();
    }
  }

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.displayDialogEditar = false;
    this.displayDialogRestriccion = false;
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
          this.crearRole();
          // this.crearOrigenesSocket();
        }
        if (tipo === 'editar') {
          this.editarRole();
        }
      }
    }
  }

  btnEditarRestricciones(): void {
    this.editarRestricciones();
  }

  crearRole(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearRole = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          vendedor: this.forma.controls.vendedor.value,
          diseniador: this.forma.controls.diseniador.value,
          token: usuario.token,
        };

        this.roleWorkerService.crearRole(data).subscribe((role: Roles) => {
          this.store.dispatch(loadingActions.cargarLoading());

          if (role.ok) {
            this.store.dispatch(loadingActions.quitarLoading());
            this.displayDialogCrear = false;
            Swal.fire('Mensaje', 'Role creado', 'success');
            this.cargarRoles();
            this.limpiarFormulario();
          } else {
            Swal.fire('Mensaje', `Error al crear role`, 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!role) {
            Swal.fire('Mensaje', 'Error al crear role', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  editarRole(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearRole = {
          nombre: this.forma.controls.nombre.value,
          estado: this.forma.controls.estado.value,
          vendedor: this.forma.controls.vendedor.value,
          diseniador: this.forma.controls.diseniador.value,
          token: usuario.token,
          id: this.role._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.roleWorkerService.editarRole(data).subscribe((roles: Roles) => {
          if (roles.ok) {
            this.displayDialogEditar = false;
            Swal.fire('Mensaje', 'Role editado', 'success');
            this.cargarRoles();
            this.limpiarFormulario();
          } else {
            Swal.fire('Mensaje', 'Error al editar role', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!roles) {
            Swal.fire('Mensaje', 'Error al editar role', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  editarRestricciones(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          token: usuario.token,
          id: this.role._id,

          restricciones: {
            sidebar: {
              catalogo: this.formaRestricciones.controls.catalogo.value,
              sucursales: this.formaRestricciones.controls.sucursales.value,
              colaboradores:
                this.formaRestricciones.controls.colaboradores.value,
              clientes: this.formaRestricciones.controls.clientes.value,
              categorias: this.formaRestricciones.controls.categorias.value,
              productos: this.formaRestricciones.controls.productos.value,
              roles: this.formaRestricciones.controls.roles.value,
              origen: this.formaRestricciones.controls.origen.value,
              prioridad: this.formaRestricciones.controls.prioridad.value,
              etapas: this.formaRestricciones.controls.etapas.value,
              colores: this.formaRestricciones.controls.colores.value,
              metodos: this.formaRestricciones.controls.metodos.value,
            },
          },
        };

        this.roleWorkerService
          .editarRestricciones(data)
          .subscribe((roles: Roles) => {
            if (roles.ok) {
              this.displayDialogRestriccion = false;
              Swal.fire('Mensaje', 'Restricciones editadas', 'success');
              this.cargarRoles();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', 'Error al editar restricciones', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!roles) {
              Swal.fire('Mensaje', 'Error al editar restricciones', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  eliminarRole(role: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este role?',
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
              id: role._id,
              token: usuario.token,
            };

            this.roleWorkerService
              .eliminarRole(data)
              .subscribe((role: Roles) => {
                if (role.ok) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Role borrado', 'success');
                  this.cargarRoles();
                  this.limpiarFormulario();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar role', 'error');
                }

                if (!role) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  Swal.fire('Mensaje', 'Error al borrar role', 'error');
                }
              });
          });
      }
    });
  }
}

interface CrearRole {
  nombre: string;
  estado: boolean;
  vendedor: boolean;
  diseniador: boolean;
  token: string;
  id?: string;
}
