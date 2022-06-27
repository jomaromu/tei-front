import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { forkJoin, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { SucursalService } from '../../services/sucursal.service';
import { AppState } from '../../reducers/globarReducers';
import { UserService } from '../../services/user.service';
import { Cliente } from '../../interfaces/clientes';
import { Roles } from '../../interfaces/roles';
import { Sucursal } from '../../interfaces/sucursales';
import { Usuario } from '../../interfaces/resp-worker';
import * as loadingActions from '../../reducers/loading/loading.actions';
import * as editarClienteActions from '../../reducers/alert-editar-cliente/editar.actions';
import Swal from 'sweetalert2';
import { ObjCat } from '../../reducers/alert-editar-cliente/editar.reducer';
import { PedidoService } from '../../services/pedido.service';
import { ActivatedRoute } from '@angular/router';
import { PedidoSocketService } from 'src/app/services/sockets/pedido-socket.service';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss'],
})
export class EditarClienteComponent implements OnInit, OnDestroy {
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;
  @Output() emitirPedido = new EventEmitter<any>();

  forma: FormGroup;
  sucursales: any;
  crear = true;
  tituloBotonHeader: string;
  roles: Roles;
  sub1: Subscription;
  sub2: Subscription;
  usuarios: Cliente;
  usuario: Cliente;
  roleUsuario = '';

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private sucursalService: SucursalService,
    private userService: UserService,
    private pedidoService: PedidoService,
    private pedidoSocketService: PedidoSocketService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.actualizarDatosPedidoSocket();
    this.crearFormulario();
    this.abrirAlert();
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

  abrirAlert(): void {
    this.sub1 = this.store.subscribe(async (data) => {
      const alert = data.alertEditarCliente;
      const worker = data.login;

      const fondo = this.fondo.nativeElement;
      const wrapCreaciones = this.wrapCreaciones.nativeElement;

      wrapCreaciones.classList.remove('animate__bounceOutUp');
      wrapCreaciones.classList.add('animate__bounceInDown');

      if (alert.abrir) {
        switch (alert.tipo) {
          case 'crear':
            fondo.style.display = 'flex';
            this.tituloBotonHeader = 'Creación Cliente';

            this.forma.reset();
            this.cargarSelects(worker.token);

            // this.detectarRole();

            this.crear = true;
            break;
          case 'editar':
            fondo.style.display = 'flex';
            this.tituloBotonHeader = 'Editar/Ver Cliente';

            this.crear = false;
            this.cargarDatosUsuarios(alert.idCat, worker.token);

            await this.userService
              .obtenerClienteID(alert.idCat, worker.token)
              .toPromise();
            this.roleUsuario = this.forma.controls.role.value;
            // this.roleInputs(usuario.usuarioDB.client_role);
            break;
          case 'eliminar':
            this.fondo.nativeElement.style.display = 'none';

            Swal.fire({
              title: 'Mensaje',
              text: '¿Desea eliminar este cliente?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Eliminar',
              cancelButtonText: 'Cancelar',
            }).then((result) => {
              if (result.isConfirmed) {
                this.userService
                  .eliminarClienteID(alert.idCat, worker.token)
                  .subscribe((usuarioDB: Cliente) => {
                    this.store.dispatch(loadingActions.cargarLoading());

                    if (usuarioDB.ok === true) {
                      this.store.dispatch(loadingActions.quitarLoading());
                      this.obtenerUsuarios();

                      if (result.isConfirmed) {
                        Swal.fire('Mensaje', `${usuarioDB.mensaje}`, 'success');
                      }
                    } else {
                      this.store.dispatch(loadingActions.quitarLoading());

                      Swal.fire('Mensaje', `${usuarioDB.mensaje}`, 'info');
                    }
                  });
              }
            });

            const modalEditarCliente: ObjCat = {
              abrir: false,
              idCat: '',
              tipo: '',
            };
            this.store.dispatch(
              editarClienteActions.abrirAlert({ modalEditarCliente })
            );
            break;
        }
      }
    });
  }

  cerrarCreacion(e: any): void {
    const fondo = this.fondo.nativeElement;
    const wrapCreaciones = this.wrapCreaciones.nativeElement;

    wrapCreaciones.classList.remove('animate__bounceInDown');
    wrapCreaciones.classList.add('animate__bounceOutUp');

    setTimeout(() => {
      fondo.style.display = 'none';

      const modalEditarCliente: ObjCat = {
        abrir: false,
        idCat: '',
        tipo: '',
      };
      this.store.dispatch(
        editarClienteActions.abrirAlert({ modalEditarCliente })
      );
    }, 800);
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
          this.usuario.usuarioDB?.sucursal?._id
        ); // obtener el nombre del populate
        this.forma.controls.observacion.setValue(
          this.usuario.usuarioDB.observacion
        );
        this.forma.controls.estado.setValue(this.usuario.usuarioDB.estado);
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

  obtenerUsuarios(): void {
    this.store
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

  guardar(): void {
    this.forma.markAllAsTouched();

    if (this.forma.status === 'VALID') {
      // cargar loading
      // this.store.dispatch(loadingActions.cargarLoading());

      this.store
        // .select('login')
        .pipe(first())
        .subscribe((datos) => {
          const worker = datos.login;
          const objCat = datos.alertEditarCliente;
          // console.log(objCat);

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
          if (objCat.tipo === 'editar') {
            // console.log(this.objCat.idCat);

            this.userService
              .editarClienteID(objCat.idCat, worker.token, data)
              .subscribe((usuario: Cliente) => {
                // console.log('ok');

                if (usuario.ok === true) {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.obtenerUsuarios();

                  Swal.fire('Mensaje', `${usuario.mensaje}`, 'info');

                  const idPedido = this.route.snapshot.queryParamMap.get('id');
                  // console.log(idPedido);

                  if (idPedido !== null) {
                    // activar socket
                    // console.log('desde aqui');
                    this.pedidoService
                      .obtenerPedido({
                        token: worker.token,
                        idPedido,
                      })
                      .subscribe();
                  } else {
                    this.emitirPedido.emit({
                      nombre: this.forma.controls.nombre.value,
                      telefono: this.forma.controls.telefono.value,
                    });
                  }

                  this.forma.reset();
                  this.fondo.nativeElement.style.display = 'none';
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire(
                    'Mensaje',
                    `${usuario.mensaje}`, // verificar las opciones
                    'error'
                  );
                }
              });
          } else if (objCat.tipo === 'crear') {
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

          const modalEditarCliente: ObjCat = {
            abrir: false,
            idCat: '',
            tipo: '',
          };
          this.store.dispatch(
            editarClienteActions.abrirAlert({ modalEditarCliente })
          );
        });
    }
  }

  actualizarDatosPedidoSocket(): void {
    this.pedidoSocketService
      .escuchar('recibir-pedido')
      .subscribe((pedido: any) => {
        // console.log(pedido);
        const idPedidoActual = this.route.snapshot.queryParamMap.get('id');
        const idPedidoDB = pedido.pedidoDB._id;

        if (idPedidoActual === idPedidoDB) {
          this.emitirPedido.emit(pedido);
        }
      });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.pedidoSocketService.quitarSubscripcion('recibir-pedido');
  }
}

interface Clientes {
  usuario: Cliente;
  roles: Roles;
  sucursales: Sucursal;
  worker?: Usuario;
}
