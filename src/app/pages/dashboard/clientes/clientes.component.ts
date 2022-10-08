import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from '../../../reducers/globarReducers';
import Swal from 'sweetalert2';

import * as loadingActions from '../../../reducers/loading/loading.actions';

import { Cliente, UsuariosDB } from '../../../interfaces/clientes';
import { Sucursal, SucursalDB } from '../../../interfaces/sucursales';
import { ClientesService } from '../../../services/clientes.service';
import { SucursalService } from '../../../services/sucursal.service';
import { Validaciones, ValidarTexto } from '../../../classes/validaciones';
import { CSocketService } from '../../../services/sockets/c-socket.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit, OnDestroy {
  clientes: Array<UsuariosDB>;
  sucursales: Array<SucursalDB>;
  cliente: UsuariosDB;
  forma: FormGroup;
  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;

  constructor(
    private store: Store<AppState>,
    private clienteService: ClientesService,
    private sService: SucursalService,
    private fb: FormBuilder,
    private validadores: Validaciones,
    private socketCliente: CSocketService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarClientes();
    this.cargarSucursales();
    this.crearClienteSocket();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      sucursales: [],
      nombre: [],
      cedula: [],
      ruc: [],
      telefono: [],
      correo: [],
      observacion: [],
      estado: [true],
    });
  }

  cargarFormularioEditar(): void {
    let mapSucursal = null;
    if (this.cliente.sucursal[0]) {
      mapSucursal = this.sucursales.find(
        (sucursal) => sucursal._id === this.cliente.sucursal[0]._id
      );
    }

    this.forma.controls.sucursales.setValue(mapSucursal);
    this.forma.controls.nombre.setValue(this.cliente.nombre);
    this.forma.controls.cedula.setValue(
      this.cliente.cedula || this.cliente.identificacion
    );
    this.forma.controls.ruc.setValue(this.cliente.ruc);
    this.forma.controls.telefono.setValue(this.cliente.telefono);
    this.forma.controls.correo.setValue(this.cliente.correo);
    this.forma.controls.observacion.setValue(this.cliente.observacion);
    this.forma.controls.estado.setValue(this.cliente.estado);
  }

  cargarClientes(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.clienteService
          .obtenerClientes(usuario.token)
          .subscribe((clientes: Cliente) => {
            // console.log(clientes);

            this.store.dispatch(loadingActions.cargarLoading());

            if (clientes.ok) {
              // this.sucursales = sucursales.sucursalesDB;
              this.clientes = clientes.usuariosDB;
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!clientes) {
              Swal.fire('Mensaje', 'Error al cargar las sucursales', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  cargarSucursales(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.sService
          .obtenerSucs(usuario.token)
          .subscribe((sucursales: Sucursal) => {
            // console.log(sucursales.sucursalesDB);
            // this.store.dispatch(loadingActions.cargarLoading());

            if (sucursales.ok) {
              this.sucursales = sucursales.sucursalesDB;
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
      });
  }

  showDialog(tipo: string, cliente?: any) {
    this.cargarSucursales();
    this.cliente = cliente;
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

  limpiarFormulario(): void {
    this.forma.controls.sucursales.reset();
    this.forma.controls.nombre.reset();
    this.forma.controls.cedula.reset();
    this.forma.controls.ruc.reset();
    this.forma.controls.telefono.reset();
    this.forma.controls.correo.reset();
    this.forma.controls.observacion.reset();
  }

  get validarSucursal(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.sucursales,
      value: this.forma.controls.sucursales.value,
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

  get validarCedula(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      size: true,
      minSize: 0,
      maxSize: 15,
      value: this.forma.controls.cedula.value,
    });
  }

  get validarRuc(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      size: true,
      minSize: 0,
      maxSize: 15,
      value: this.forma.controls.ruc.value,
    });
  }

  get validarTelefono(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: true,
      size: false,
      value: this.forma.controls.telefono.value,
    });
  }

  get validarCorreo(): ValidarTexto {
    return this.validadores.validarCorreo({
      requerido: false,
      value: this.forma.controls.correo.value,
    });
  }

  get validarObservacion(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      value: this.forma.controls.observacion.value,
    });
  }

  btnGuardar(tipo: string): void {
    // console.log(this.forma.controls.sucursales.value);
    if (
      !this.validarSucursal.valido ||
      !this.validarNombre.valido ||
      !this.validarCedula.valido ||
      !this.validarRuc.valido ||
      !this.validarTelefono.valido ||
      !this.validarCorreo.valido ||
      !this.validarObservacion.valido
    ) {
      this.forma.markAllAsTouched();
      return;
    } else {
      // console.log(tipo);
      if (!tipo) {
        tipo = 'editar';
      } else {
        if (tipo === 'crear') {
          this.crearCliente();
          this.crearClienteSocket();
        }

        if (tipo === 'editar') {
          this.editarCliente();
        }
      }
    }
  }

  crearCliente(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearCliente = {
          nombre: this.forma.controls.nombre.value,
          cedula: this.forma.controls.cedula.value,
          ruc: this.forma.controls.ruc.value,
          telefono: this.forma.controls.telefono.value,
          correo: this.forma.controls.correo.value,
          observacion: this.forma.controls.observacion.value,
          sucursal: this.forma.controls.sucursales.value._id,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
        };

        this.clienteService.crearCliente(data).subscribe((cliente: Cliente) => {
          this.store.dispatch(loadingActions.cargarLoading());

          if (cliente.ok) {
            this.store.dispatch(loadingActions.quitarLoading());
            this.displayDialogCrear = false;
            Swal.fire('Mensaje', 'Cliente creado', 'success');
            this.cargarClientes();
            this.limpiarFormulario();
          } else {
            Swal.fire(
              'Mensaje',
              `Error al crear un cliente: ${cliente.err.message}`,
              'error'
            );
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!cliente) {
            Swal.fire('Mensaje', 'Error al crear una cliente', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  editarCliente(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearCliente = {
          nombre: this.forma.controls.nombre.value,
          cedula: this.forma.controls.cedula.value,
          ruc: this.forma.controls.ruc.value,
          telefono: this.forma.controls.telefono.value,
          correo: this.forma.controls.correo.value,
          observacion: this.forma.controls.observacion.value,
          sucursal: this.forma.controls.sucursales.value._id,
          estado: this.forma.controls.estado.value,
          token: usuario.token,
          id: this.cliente._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.clienteService
          .editarCliente(data)
          .subscribe((cliente: Cliente) => {
            if (cliente.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Cliente editado', 'success');
              this.cargarClientes();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', 'Error al editar cliente', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!cliente) {
              Swal.fire('Mensaje', 'Error al editar cliente', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  eliminarCliente(cliente: any): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea borrar este Cliente?',
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
              id: cliente._id,
              token: usuario.token,
            };

            this.clienteService.eliminarCliente(data).subscribe((cliente) => {
              if (cliente.ok) {
                this.store.dispatch(loadingActions.quitarLoading());
                Swal.fire('Mensaje', 'Cliente borrado', 'success');
                this.cargarClientes();
                this.limpiarFormulario();
              } else {
                this.store.dispatch(loadingActions.quitarLoading());
                Swal.fire('Mensaje', 'Error al borrar cliente', 'error');
              }

              if (!cliente) {
                this.store.dispatch(loadingActions.quitarLoading());
                Swal.fire('Mensaje', 'Error al borrar cliente', 'error');
              }
            });
          });
      }
    });
  }

  // sockets
  crearClienteSocket(): void {
    this.socketCliente.escuchar('cargar-clientes').subscribe((clientes) => {
      // console.log('ok');
      this.cargarClientes();
    });
  }

  ngOnDestroy(): void {
    this.socketCliente.destruirSocket('cargar-clientes');
  }
}

interface CrearCliente {
  nombre: string;
  cedula: string;
  ruc: string;
  telefono: string;
  correo: string;
  observacion: string;
  sucursal: string;
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
