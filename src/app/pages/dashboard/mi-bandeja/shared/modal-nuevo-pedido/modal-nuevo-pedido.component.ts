import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { environment } from '../../../../../../environments/environment';
import { first, take } from 'rxjs/operators';
import { AppState } from '../../../../../reducers/globarReducers';
import { EtapasService } from '../../../../../services/etapas.service';
import { PrioridadService } from '../../../../../services/prioridad.service';
import { SucursalService } from '../../../../../services/sucursal.service';
import { forkJoin, timer } from 'rxjs';
import { Sucursal, SucursalDB } from '../../../../../interfaces/sucursales';
import {
  PrioridadDB,
  PrioridadOrdenada,
} from '../../../../../interfaces/prioridad';
import { EtapaDB, EtapaOrdenada } from '../../../../../interfaces/etapas';
import { ClientesService } from '../../../../../services/clientes.service';
import { Cliente, UsuariosDB } from '../../../../../interfaces/clientes';
import * as moment from 'moment';
import { isWeekDay } from 'moment-business';
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import { PedidoService } from 'src/app/services/pedido.service';
import * as loadingActions from '../../../../../reducers/loading/loading.actions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-nuevo-pedido',
  templateUrl: './modal-nuevo-pedido.component.html',
  styleUrls: ['./modal-nuevo-pedido.component.scss'],
})
export class ModalNuevoPedidoComponent implements OnInit {
  forma: FormGroup;
  @Input() displayDialogCrear = false;
  @Output() closeDialogCrear = new EventEmitter<boolean>();
  @Output() emitCrearPedido = new EventEmitter<string>();
  sucursales: Array<SucursalDB> = [];
  prioridades: Array<PrioridadDB> = [];
  clientes: Array<UsuariosDB> = [];
  cliente: UsuariosDB;
  etapas: Array<EtapaDB> = [];
  isWeekDay: boolean;
  weekdDay = 0;
  contadorDias = 0;
  fecha: string;
  existeClient = false;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private sucursalService: SucursalService,
    private prioridadService: PrioridadService,
    private etapasService: EtapasService,
    private clienteService: ClientesService,
    private validadores: Validaciones,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.manejarPDatePicker();
  }

  crearFormulario(): void {
    this.forma = this.fb.group({
      fechaEntrega: [],
      sucursales: [],
      prioridad: [],
      etapa: [],
      nombre: [],
      telefono: [],
    });
  }

  showDialog(): void {
    this.cargarSucursales();
    this.cargarPrioridades();
    this.cargarEtapas();
    this.cargarFecha();
    this.existeClient = this.existeCliente();
  }

  cargarSucursales(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.sucursalService
          .obtenerSucs(usuario.token)
          .subscribe((sucursales: Sucursal) => {
            this.sucursales = sucursales.sucursalesDB;
            // console.log(sucursales);
          });
      });
  }

  cargarPrioridades(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          colPrioridad: environment.colPrioridad,
          token: usuario.token,
        };

        this.prioridadService
          .obtenerPrioridadesOrdenadas(data)
          .subscribe((prioridadesDB: PrioridadOrdenada) => {
            this.prioridades = prioridadesDB.prioridadesOrdenadaDB.prioridades;
            // console.log(prioridadesDB);
          });
      });
  }

  cargarFecha(): void {
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

    this.fecha = moment().add(this.contadorDias, 'days').format('DD/MM/YYYY');
    this.forma.controls.fechaEntrega.setValue(this.fecha);
  }

  cargarEtapas(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          colEtapas: environment.colEtapas,
          token: usuario.token,
        };

        this.etapasService
          .obtenerEtapasOrdenadas(data)
          .subscribe((etapasDB: EtapaOrdenada) => {
            this.etapas = etapasDB.etapasOrdenadaDB.etapas;
            // console.log(etapasDB);
          });
      });
  }

  buscarClientes(e: Event): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const criterio: string = (e.target as HTMLInputElement).value;

        const data = {
          token: usuario.token,
          criterio,
        };

        this.clienteService
          .obtenerPorBusqueda(data)
          .subscribe((clientes: Cliente) => {
            this.clientes = clientes.usuariosDB;
          });
      });
  }

  setTelefono(): void {
    this.forma.controls.telefono.setValue(this.forma.controls.nombre.value);
    this.cliente = this.forma.controls.nombre.value;
    this.existeClient = this.existeCliente();
  }

  setNombre(): void {
    this.forma.controls.nombre.setValue(this.forma.controls.telefono.value);
    this.cliente = this.forma.controls.telefono.value;
    this.existeClient = this.existeCliente();
  }

  existeCliente(): boolean {
    const idCliente = (this.forma.controls.nombre.value as UsuariosDB)?._id;

    const findCliente = this.clientes.find(
      (cliente) => cliente._id === idCliente
    );

    if (findCliente) {
      return true;
    } else {
      return false;
    }
  }

  manejarPDatePicker(): void {
    const time = timer(0, 200).subscribe((resp) => {
      const datePicker = document.getElementById('nuevoPedidoPicker');

      if (datePicker) {
        const dp = datePicker as HTMLElement;
        // (datePicker[0] as HTMLElement).style.zIndex = '9999';
        dp.style.position = 'fixed';
        dp.style.zIndex = '9';
        // dp.style.top = '0';
        // dp.style.border = '1px solid blue';
        // dp.style.overflow = 'scroll';

        time.unsubscribe();
      }
    });
  }

  abrirCalendar(): void {
    this.manejarPDatePicker();
  }

  limpiarFormulario(): void {
    this.forma.controls.nombre.reset();
    this.forma.controls.telefono.reset();
    this.forma.controls.sucursales.reset();
    this.forma.controls.prioridad.reset();
    this.forma.controls.etapa.reset();
  }

  eventCerrarModal(e: boolean): void {
    this.displayDialogCrear = e;
  }

  get validarNombre(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.clientes,
      value: this.forma.controls.nombre.value,
    });
  }

  get validarTelefono(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.clientes,
      value: this.forma.controls.telefono.value,
    });
  }

  get validarFecha(): ValidarTexto {
    return this.validadores.validarFecha({
      requerido: true,
      value: this.forma.controls.fechaEntrega.value,
    });
  }

  get validarSucursal(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.sucursales,
      value: this.forma.controls.sucursales.value,
    });
  }

  get validarPrioridad(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.prioridades,
      value: this.forma.controls.prioridad.value,
    });
  }

  get validarEtapas(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.etapas,
      value: this.forma.controls.etapa.value,
    });
  }

  btnGuardar(): void {
    if (
      !this.validarNombre.valido ||
      !this.validarTelefono.valido ||
      !this.validarFecha.valido ||
      !this.validarSucursal.valido ||
      !this.validarPrioridad.valido ||
      !this.validarEtapas.valido
    ) {
      this.forma.markAllAsTouched();
      return;
    } else {
      this.crearPedido();
    }
  }

  crearPedido(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          cliente: this.forma.controls.nombre.value._id,
          vendedor: usuario.usuarioDB._id,
          sucursal: this.forma.controls.sucursales.value._id,
          fechaEntrega: this.forma.controls.fechaEntrega.value,
          fechaRegistro: moment().format('DD/MM/YYYY'),
          prioridad: this.forma.controls.prioridad.value._id,
          etapa: this.forma.controls.etapa.value._id,
          token: usuario.token,
        };

        this.pedidoService.crearPedido(data).subscribe((pedidos: any) => {
          this.store.dispatch(loadingActions.cargarLoading());

          if (pedidos.ok) {
            this.store.dispatch(loadingActions.quitarLoading());
            this.displayDialogCrear = false;
            Swal.fire('Mensaje', 'Pedido creado', 'success');
            this.emitCrearPedido.emit('crear-pedido');
            this.limpiarFormulario();
          } else {
            Swal.fire('Mensaje', 'Error crear un pedido', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!pedidos) {
            Swal.fire('Mensaje', 'Error crear un pedido', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  closeDialog(): void {
    this.closeDialogCrear.emit(false);
    this.displayDialogCrear = false;
    this.limpiarFormulario();
  }
}
