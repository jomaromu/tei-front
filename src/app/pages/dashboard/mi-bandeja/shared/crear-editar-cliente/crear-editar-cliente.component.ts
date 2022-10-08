import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { SucursalService } from '../../../../../services/sucursal.service';
import { AppState } from '../../../../../reducers/globarReducers';
import { Sucursal } from '../../../../../interfaces/sucursales';
import Swal from 'sweetalert2';
import {
  Validaciones,
  ValidarTexto,
} from '../../../../../classes/validaciones';
import { ClientesService } from '../../../../../services/clientes.service';
import { Cliente, UsuariosDB } from '../../../../../interfaces/clientes';
import * as loadingActions from '../../../../../reducers/loading/loading.actions';

@Component({
  selector: 'app-crear-editar-cliente',
  templateUrl: './crear-editar-cliente.component.html',
  styleUrls: ['./crear-editar-cliente.component.scss'],
})
export class CrearEditarClienteComponent implements OnInit {
  modalCrearCliente = false;
  forma: FormGroup;
  displayDialogCrear = false;
  displayDialogEditar = false;
  sucursales: Array<any>;
  cliente: UsuariosDB;
  @Input() existeClient = false;
  @Input() inputCliente: UsuariosDB;

  @Output() emitCerrarModalNuevoPedido = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private sService: SucursalService,
    private validadores: Validaciones,
    private clienteService: ClientesService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarSucursales();
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
    // console.log(this.sucursales);
    // return;
    let mapSucursal = null;
    if (this.inputCliente?.sucursal) {
      mapSucursal = this.sucursales.find(
        (sucursal) => sucursal?._id === this.inputCliente?.sucursal?._id
      );
    }

    this.forma.controls.sucursales.setValue(mapSucursal);
    this.forma.controls.nombre.setValue(this.inputCliente.nombre);
    this.forma.controls.cedula.setValue(
      this.inputCliente.cedula || this.inputCliente.identificacion
    );
    this.forma.controls.ruc.setValue(this.inputCliente.ruc);
    this.forma.controls.telefono.setValue(this.inputCliente.telefono);
    this.forma.controls.correo.setValue(this.inputCliente.correo);
    this.forma.controls.observacion.setValue(this.inputCliente.observacion);
    this.forma.controls.estado.setValue(this.inputCliente.estado);
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

  showDialog(tipo: string): void {
    this.cargarSucursales();

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
          // this.crearClienteSocket();
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
          id: this.inputCliente._id,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.clienteService
          .editarCliente(data)
          .subscribe((cliente: Cliente) => {
            if (cliente.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Cliente editado', 'success');

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

  closeDialog(): void {
    this.displayDialogCrear = false;
    this.displayDialogEditar = false;
    this.limpiarFormulario();
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
