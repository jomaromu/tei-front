import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs/operators';
import { AppState } from '../../reducers/globarReducers';
import { formatDate } from '@angular/common';

import { SucursalService } from '../../services/sucursal.service';
import { UserService } from '../../services/user.service';
import { Data, PedidoService } from '../../services/pedido.service';

import * as moment from 'moment';
moment.locale('en');

import Swal from 'sweetalert2';
import { isWeekDay } from 'moment-business';
import { Cliente } from '../../interfaces/clientes';
import { Usuario } from '../../interfaces/resp-worker';
import { Sucursal } from '../../interfaces/sucursales';
import { Router } from '@angular/router';
import { Pedido } from '../../interfaces/pedido';
import { PedidoSocketService } from '../../services/sockets/pedido-socket.service';
import { forkJoin, Subscription } from 'rxjs';
import { Roles } from '../../interfaces/roles';
import * as loadingActions from '../../reducers/loading/loading.actions';
import * as editarClienteActions from '../../reducers/alert-editar-cliente/editar.actions';
import { ObjCat } from '../../reducers/alert-editar-cliente/editar.reducer';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit, OnDestroy {
  @ViewChild('placeHolderCliente', { static: true })
  placeHolderCliente: ElementRef<HTMLElement>;
  @ViewChild('placeHolderClienteCel', { static: true })
  placeHolderClienteCel: ElementRef<HTMLElement>;
  @ViewChild('wrapCreaciones', { static: true })
  wrapCreaciones: ElementRef<HTMLElement>;
  @ViewChild('nombre', { static: true }) nombre: ElementRef<HTMLElement>;
  @ViewChild('cliente', { static: false }) cliente: ElementRef<HTMLElement>;
  @ViewChild('fondo', { static: false }) fondo: ElementRef<HTMLElement>;

  forma: FormGroup;
  forma2: FormGroup;
  sucursales: Sucursal;
  fecha: string;
  weekdDay = 0;
  contadorDias = 0;
  isWeekDay: boolean;
  clientes: Array<any>;
  idCliente: string;
  roles: Roles;
  usuario: Cliente;
  editarCliente = false;
  tituloBotonHeader = 'Editar/Ver Cliente';
  roleUsuario = '';
  crear = false;
  sub1: Subscription;

  constructor(
    private fb: FormBuilder,
    private sucursalService: SucursalService,
    private userService: UserService,
    private pedidoService: PedidoService,
    private store: Store<AppState>,
    private router: Router,
    private pedidoSocketService: PedidoSocketService
  ) {}

  ngOnInit(): void {
    this.cargarFechaEntrega();
    this.crearFormulario();
    this.crearFormularioEditar();
    this.cargarSelects();
    this.ocultarPlaceHolders();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      nombre: [null, [Validators.required]],
      sucursal: [null, [Validators.required]],
      telefono: [null, [Validators.required]],
      fecha: [
        formatDate(this.fecha, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
    });
  }

  crearFormularioEditar(): void {
    this.forma2 = this.fb.group({
      nombreEditar: [null, [Validators.required]],
      apellidoEditar: [null],
      role: [null],
      sucursalEditar: [null],
      telefonoEditar: [null, [Validators.required]],
      identificacionEditar: [null],
      rucEditar: [null],
      correoEditar: [
        null,
        [Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$')],
      ],
      observacionEditar: [null],
      estadoEditar: [true],
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

  get checkSucursal(): boolean {
    if (
      this.forma.controls.sucursal.touched &&
      this.forma.controls.sucursal.status === 'INVALID'
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

  get checkFecha(): boolean {
    if (
      this.forma.controls.fecha.touched &&
      this.forma.controls.fecha.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkIdentificacion(): boolean {
    if (
      this.forma2.controls.identificacionEditar.touched &&
      this.forma2.controls.identificacionEditar.status === 'INVALID'
    ) {
      return true;
    }
  }

  get checkRuc(): boolean {
    if (
      this.forma2.controls.rucEditar.touched &&
      this.forma2.controls.rucEditar.status === 'INVALID'
    ) {
      return true;
    }
  }

  cargarSelects(): void {
    this.sub1 = this.store.select('login').subscribe((usuario) => {
      const sucursalesDB = this.sucursalService.obtenerSucursales(
        usuario.token
      );

      sucursalesDB.subscribe((sucursales: Sucursal) => {
        this.sucursales = sucursales;
        this.forma.controls.sucursal.setValue(usuario.usuario?.sucursal?._id);
      });
    });
  }

  cargarFechaEntrega(): void {
    this.isWeekDay = isWeekDay(moment().add(1, 'days'));

    while (this.weekdDay !== 3) {
      if (this.isWeekDay) {
        this.weekdDay++;
        this.contadorDias++;

        this.isWeekDay = isWeekDay(moment().add(this.contadorDias + 1, 'days'));
      } else {
        this.weekdDay += 0;
        this.contadorDias++;
        this.isWeekDay = isWeekDay(moment().add(this.contadorDias + 1, 'days'));
      }
    }

    this.fecha = moment().add(this.contadorDias, 'days').format('YYYY-MM-DD');
  }

  fechaEntregaManual(e: any): void {
    const fecha: any = document.getElementById('fecha');
    this.fecha = fecha.value;
  }

  buscarClienteNombre(e: any): void {
    this.idCliente = null;

    const placeHolderCliente = this.placeHolderCliente.nativeElement;
    const nombre = this.nombre.nativeElement;
    let objCliente = {};

    if (this.forma.controls.nombre.status === 'INVALID') {
      placeHolderCliente.style.display = 'none';
      this.editarCliente = false;
    }

    if (this.forma.controls.nombre.status === 'VALID') {
      // placeHolderCliente.style.display = 'block';

      this.store
        .select('login')
        .pipe(first())
        .subscribe((worker) => {
          const data = {
            token: worker.token,
            criterio: this.forma.controls.nombre.value,
          };

          this.userService
            .obtenerClienteCriterioNombre(data)
            .subscribe((clientes: Cliente) => {
              if (clientes.ok === true && clientes.usuariosDB.length !== 0) {
                placeHolderCliente.style.display = 'block';

                const mapClientes = clientes.usuariosDB.map((cliente) => {
                  if (
                    cliente.client_role === 'EmpresaRole' ||
                    cliente.client_role === 'EmpresaVIPRole'
                  ) {
                    objCliente = {
                      nombre: cliente.nombre,
                      telefono: cliente.telefono,
                      sucursal: cliente.sucursal,
                      idCliente: cliente._id,
                    };
                  } else {
                    objCliente = {
                      nombre: `${cliente.nombre}`, // ${cliente.apellido}
                      telefono: cliente.telefono,
                      sucursal: cliente.sucursal,
                      idCliente: cliente._id,
                    };
                  }

                  return objCliente;
                });

                // console.log(mapClientes);
                this.clientes = mapClientes;

                // const placeHolderCliente = this.placeHolderCliente.nativeElement;

                if (this.clientes?.length === 0) {
                  placeHolderCliente.style.display = 'none';
                }
              }
            });
        });
    }

    // console.log(this.forma.controls.nombre.value);
  }

  buscarClienteTelefono(e: any): void {
    this.idCliente = null;

    const placeHolderClienteCel = this.placeHolderClienteCel.nativeElement;
    const nombre = this.nombre.nativeElement;
    let objCliente = {};

    if (this.forma.controls.telefono.status === 'INVALID') {
      placeHolderClienteCel.style.display = 'none';
      this.editarCliente = false;
    }

    if (this.forma.controls.telefono.status === 'VALID') {
      // placeHolderClienteCel.style.display = 'block';

      this.store
        .select('login')
        .pipe(first())
        .subscribe((worker) => {
          const data = {
            token: worker.token,
            telefono: this.forma.controls.telefono.value,
          };

          this.userService
            .obtenerClienteCriterioTelefono(data)
            .subscribe((clientes: Cliente) => {
              if (clientes.ok === true && clientes.usuariosDB.length !== 0) {
                placeHolderClienteCel.style.display = 'block';

                const mapClientes = clientes.usuariosDB.map((cliente) => {
                  if (
                    cliente.client_role === 'EmpresaRole' ||
                    cliente.client_role === 'EmpresaVIPRole'
                  ) {
                    objCliente = {
                      nombre: cliente.nombre,
                      telefono: cliente.telefono,
                      sucursal: cliente.sucursal,
                      idCliente: cliente._id,
                    };
                  } else {
                    objCliente = {
                      nombre: `${cliente.nombre}`, // ${cliente.apellido}
                      telefono: cliente.telefono,
                      sucursal: cliente.sucursal,
                      idCliente: cliente._id,
                    };
                  }

                  return objCliente;
                });

                // console.log(mapClientes);
                this.clientes = mapClientes;

                // const placeHolderClienteCel = this.placeHolderClienteCel.nativeElement;

                if (this.clientes?.length === 0) {
                  placeHolderClienteCel.style.display = 'none';
                }
              }
            });
        });
    }

    // console.log(this.forma.controls.nombre.value);
  }

  detectarCliente(e: any): void {
    this.idCliente = e.idCliente;

    const placeHolderCliente = this.placeHolderCliente.nativeElement;
    const placeHolderClienteCel = this.placeHolderClienteCel.nativeElement;

    this.forma.controls.nombre.setValue(e.nombre);
    this.forma.controls.telefono.setValue(e.telefono);
    // this.forma.controls.sucursal.setValue(e.sucursal._id);

    placeHolderCliente.style.display = 'none';
    placeHolderClienteCel.style.display = 'none';

    if (
      this.idCliente !== '' &&
      this.idCliente !== undefined &&
      this.idCliente !== null
    ) {
      this.editarCliente = true;
    } else {
      this.editarCliente = false;
    }
  }

  ocultarPlaceHolders(): void {
    const wrapCreaciones = this.wrapCreaciones.nativeElement;
    const placeHolderCliente = this.placeHolderCliente.nativeElement;
    const placeHolderClienteCel = this.placeHolderClienteCel.nativeElement;

    wrapCreaciones.addEventListener('click', () => {
      placeHolderCliente.style.display = 'none';
      placeHolderClienteCel.style.display = 'none';
    });
  }

  limpiarForma(): void {
    // this.forma.reset();
    this.forma.controls.nombre.reset();
    this.forma.controls.telefono.reset();
    this.forma.controls.sucursal.reset();
  }

  guardar(): void {
    this.forma.markAllAsTouched();

    if (this.forma.status === 'INVALID') {
      return;
    }

    if (this.forma.status === 'VALID') {
      if (this.idCliente === null) {
        Swal.fire('Mensaje', `Cliente no existe en la base de datos`, 'error');

        return;
      }

      this.store
        .select('login')
        .pipe(first())
        .subscribe((worker) => {
          this.userService
            .obtenerClienteID(this.idCliente, worker.token)
            .subscribe((client: Usuario) => {
              if (client.ok === false) {
                Swal.fire('Mensaje', `${client.mensaje}`, 'error');
              } else {
                const data = {
                  cliente: this.idCliente,
                  sucursal: this.forma.controls.sucursal.value,
                  fecha_entrega: this.forma.controls.fecha.value,
                  token: worker.token,
                  vendedor: worker.usuario._id,
                };

                // console.log(data);
                this.pedidoService
                  .crearPedido(data)
                  .subscribe((pedido: Pedido) => {
                    if (pedido.ok === false) {
                      Swal.fire('Mensaje', `${pedido.mensaje}`, 'error');
                    } else if (pedido.ok === true) {
                      // Llamar a socket
                      this.pedidoSocketService.emitir('solicitar-pedidos');

                      // console.log(pedido);
                      this.router.navigate(['dashboard/pedido'], {
                        queryParams: { id: pedido.pedidoDB._id },
                      });

                      const data2: Data = {
                        token: worker.token,
                        role: worker.usuario.colaborador_role,
                        idSucursalWorker: worker.usuario.sucursal._id,
                        idUsuario: worker.usuario._id,
                      };

                      // Peticion para activar socket
                      this.pedidoService
                        .obtenerPedidos(worker.token)
                        .subscribe();

                      // Swal.fire({
                      //   title: 'Mensaje',
                      //   text: 'Pedido creado',
                      //   icon: 'info',
                      //   showCancelButton: false,
                      //   confirmButtonColor: '#3085d6',
                      //   cancelButtonColor: '#d33',
                      //   confirmButtonText: 'Ok',
                      //   cancelButtonText: 'Nuevo pedido'
                      // }).then((result) => {
                      //   if (result.isConfirmed) {
                      //     this.router.navigate(['dashboard/pedido'], { queryParams: { id: pedido.pedidoDB._id } });
                      //   }
                      //    else {
                      //     this.limpiarForma();
                      //   }
                      // });
                    } else {
                      Swal.fire('Mensaje', `${pedido.mensaje}`, 'error');
                    }
                  });
              }
            });
        });
    }
  }

  // ============================================================= //

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

  recibirPedido(campos: any): void {
    this.forma.controls.nombre.setValue(campos.nombre);
    this.forma.controls.telefono.setValue(campos.telefono);
  }

  ngOnDestroy(): void {}
}

interface Clientes {
  usuario: Cliente;
  roles: Roles;
  sucursales: Sucursal;
  worker?: Usuario;
}
