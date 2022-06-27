import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterContentChecked,
  OnDestroy,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { CatalogoShared } from '../../interfaces/catalogo-shared';
import { Cliente } from '../../interfaces/clientes';
import { Roles } from '../../interfaces/roles';
import { AppState } from '../../reducers/globarReducers';
import { UserService } from '../../services/user.service';
import { Usuario } from '../../interfaces/resp-worker';
import { first, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as loadingActions from '../../reducers/loading/loading.actions';
import { forkJoin, Subscription } from 'rxjs';
import { Sucursal } from '../../interfaces/sucursales';
import { SucursalService } from '../../services/sucursal.service';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';
import * as editarClienteActions from '../../reducers/alert-editar-cliente/editar.actions';
import { ObjCat } from '../../reducers/alert-editar-cliente/editar.reducer';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent
  implements OnInit, AfterContentChecked, OnDestroy
{
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;

  catalogo: CatalogoShared;
  usuarios: Cliente;
  usuario: Cliente;
  objCat: any;
  crear = true;
  roles: Roles;
  sucursales: Sucursal;
  tituloBotonHeader = '';
  roleUsuario = '';
  sub1: Subscription;
  sub2: Subscription;

  forma: FormGroup;

  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private sucursalService: SucursalService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
    this.crearFormulario();
    this.busqueda();
  }

  ngAfterContentChecked(): void {
    this.catalogo = {
      tipo: 'clientes',
      iconoTituloHeader: 'fas fa-user-lock',
      tituloHeader: 'Información Clientes',
      tituloBotonHeader: 'Crear Cliente',
      iconoBotonHeader: 'fas fa-plus',
      tituloTabla: ['#', 'Nombre', 'Teléfono', 'Correo', 'Estado', 'Controles'],
      tablas: this.usuarios?.usuariosDB,
    };
  }

  obtenerUsuarios(): void {
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker: Usuario) => {
        this.userService
          .obtenerClientes(worker.token)
          .subscribe((usuarios: Cliente) => {
            // console.log(usuarios);

            if (usuarios.ok === false) {
              console.log('error');
            } else {
              this.usuarios = usuarios;
            }
          });
      });
  }

  abrirAlert(objCat: any): void {
    const modalEditarCliente: ObjCat = {
      abrir: true,
      idCat: objCat.idCat,
      tipo: objCat.tipo,
    };
    this.store.dispatch(
      editarClienteActions.abrirAlert({ modalEditarCliente })
    );
  }

  get checkNombre(): boolean {
    if (
      this.forma.controls.nombre.touched &&
      this.forma.controls.nombre.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkApellido(): boolean {
    if (
      this.forma.controls.apellido.touched &&
      this.forma.controls.apellido.status === 'INVALID'
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

  get checkIdentificacion(): boolean {
    if (
      this.forma.controls.identificacion.touched &&
      this.forma.controls.identificacion.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkRuc(): boolean {
    if (
      this.forma.controls.ruc.touched &&
      this.forma.controls.ruc.status === 'INVALID'
    ) {
      return true;
    }
  }

  // get checkCorreo(): boolean {
  //   if (
  //     this.forma.controls.correo.touched &&
  //     this.forma.controls.correo.status === 'INVALID'
  //   ) {
  //     return true;
  //   }
  // }

  get checkRole(): boolean {
    if (
      this.forma.controls.role.touched &&
      this.forma.controls.role.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkSucursal(): boolean {
    if (
      this.forma.controls.sucursal.touched &&
      this.forma.controls.sucursal.status === 'INVALID'
    ) {
      return true;
    }
  }

  // Validators.required,
  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      apellido: [null],
      role: [null],
      sucursal: [null],
      telefono: [null, [Validators.required]],
      identificacion: [null],
      ruc: [null],
      correo: [
        null,
        [Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$')],
      ],
      observacion: [null],
      estado: [true],
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

  cargarDatosUsuarios(idUsuario: string, token: string): void {
    const usuario = this.userService.obtenerClienteID(idUsuario, token);
    const sucursales = this.sucursalService.obtenerSucursales(token);
    const roles = this.userService.obtenerClienteRoles(token);

    forkJoin([usuario, sucursales, roles])
      .pipe(
        map((resp: Array<any>) => {
          const objResp: Clientes = {
            usuario: resp[0],
            sucursales: resp[1],
            roles: resp[2],
          };

          return objResp;
        })
      )
      .subscribe((data: Clientes) => {
        // console.log(data);
        this.roles = data.roles;
        this.sucursales = data.sucursales;

        this.usuario = data.usuario;

        // console.log(this.usuario.usuarioDB.sucursal);

        this.forma.controls.nombre.setValue(this.usuario.usuarioDB.nombre);
        this.forma.controls.apellido.setValue(this.usuario.usuarioDB.apellido);
        this.forma.controls.identificacion.setValue(
          this.usuario.usuarioDB.identificacion
        );
        this.forma.controls.ruc.setValue(this.usuario.usuarioDB.ruc);
        this.forma.controls.telefono.setValue(this.usuario.usuarioDB.telefono);
        this.forma.controls.correo.setValue(this.usuario.usuarioDB.correo);
        this.forma.controls.role.setValue(this.usuario.usuarioDB.client_role);
        this.forma.controls.sucursal.setValue(
          this.usuario.usuarioDB.sucursal._id
        ); // obtener el nombre del populate
        this.forma.controls.observacion.setValue(
          this.usuario.usuarioDB.observacion
        );
        this.forma.controls.estado.setValue(this.usuario.usuarioDB.estado);
      });
  }

  cargarSelects(token: string): void {
    this.forma.controls.role.setValue('ComunRole');

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const idSucursal = worker.usuario.sucursal._id;

        this.forma.controls.sucursal.setValue(idSucursal);
        // console.log();
      });

    const sucursales = this.sucursalService.obtenerSucursales(token);
    const roles = this.userService.obtenerClienteRoles(token);

    forkJoin([sucursales, roles])
      .pipe(
        map((resp: Array<any>) => {
          const objResp: Clientes = {
            usuario: null,
            sucursales: resp[0],
            roles: resp[1],
            // worker: resp[2],
          };

          // console.log(objResp);
          return objResp;
        })
      )
      .subscribe((data: Clientes) => {
        // console.log(data);
        this.roles = data.roles;
        this.sucursales = data.sucursales;
      });
  }

  // detectarRole(): void {

  //   this.roleUsuario = this.forma.controls.role.value;
  //   this.roleInputs(this.roleUsuario);
  // }

  // roleInputs(role: string): void {

  //   if (role === 'ComunRole' || role === 'ComunVIPRole' || role === 'ComunFrecuenteRole') {

  //     this.forma.controls.apellido.enable();
  //     this.forma.controls.ruc.disable();
  //     this.forma.controls.identificacion.enable();
  //   }

  //   if (role === 'EmpresaVIPRole' || role === 'EmpresaRole') {

  //     this.forma.controls.apellido.disable();
  //     this.forma.controls.ruc.enable();
  //     this.forma.controls.identificacion.disable();
  //   }
  // }

  guardar(): void {
    this.forma.markAllAsTouched();

    if (this.forma.status === 'VALID') {
      // cargar loading
      // this.store.dispatch(loadingActions.cargarLoading());

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
            apellido: this.forma.controls.apellido.value,
            identificacion: this.forma.controls.identificacion.value,
            ruc: this.forma.controls.ruc.value,
            telefono: this.forma.controls.telefono.value,
            correo: this.forma.controls.correo.value,
            client_role: 'null',
            sucursal: this.forma.controls.sucursal.value,
            observacion: this.forma.controls.observacion.value,
            password: '12345678',
            estado: castEstado,
            //  falta observacion
            token: worker.token,
          };

          // console.log(data);
          // return;
          if (this.objCat.tipo === 'editar') {
            // console.log(this.objCat.idCat);

            this.userService
              .editarClienteID(this.objCat.idCat, worker.token, data)
              .subscribe((usuario: Cliente) => {
                // console.log(this.objCat.idCat);

                if (usuario.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerUsuarios();

                  Swal.fire('Mensaje', `${usuario.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire(
                    'Mensaje',
                    `${usuario.mensaje}`, // verificar las opciones
                    'error'
                  );
                }
              });
          } else if (this.objCat.tipo === 'crear') {
            this.userService
              .crearCliente(data)
              .subscribe((usuario: Cliente) => {
                if (usuario.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerUsuarios();

                  Swal.fire('Mensaje', `${usuario.mensaje}`, 'info');

                  this.fondo.nativeElement.style.display = 'none';

                  this.forma.reset();
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire(
                    'Mensaje',
                    `${usuario.mensaje}`, // verificar opciones
                    'error'
                  );
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

    this.sub2 = this.store.subscribe((dataRedux) => {
      const token = dataRedux.login.token;
      const criterio = dataRedux.busqueda.criterio;

      const data = {
        token,
        criterio,
      };

      this.userService
        .obtenerClienteCriterioNombre(data)
        .subscribe((clientes: Cliente) => {
          // console.log(clientes);
          this.usuarios = clientes;
        });
    });
    // });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}

interface Clientes {
  usuario: Cliente;
  roles: Roles;
  sucursales: Sucursal;
  worker?: Usuario;
}

type clientRole =
  | 'ComunRole'
  | 'EmpresaRole'
  | 'EmpresaVIPRole'
  | 'ComunVIPRole'
  | 'ComunFrecuenteRole';
