import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from 'src/app/classes/validaciones';
import { Cliente, UsuariosDB } from 'src/app/interfaces/clientes';
import { ColorDB, Colores } from 'src/app/interfaces/colores';
import { EtapaDB, EtapaOrdenada } from 'src/app/interfaces/etapas';
import { OrigenPedido } from 'src/app/interfaces/origen-pedido';
import { Pedido, PedidoDB } from 'src/app/interfaces/pedido';
import { PrioridadDB, PrioridadOrdenada } from 'src/app/interfaces/prioridad';
import { Usuario, UsuarioWorker } from 'src/app/interfaces/resp-worker';
import { Sucursal, SucursalDB } from 'src/app/interfaces/sucursales';
import { AppState } from 'src/app/reducers/globarReducers';
import { ClientesService } from 'src/app/services/clientes.service';
import { ColorService } from 'src/app/services/color.service';
import { EtapasService } from 'src/app/services/etapas.service';
import { OrigenPedidoService } from 'src/app/services/origen-pedido.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { PrioridadService } from 'src/app/services/prioridad.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as loadingActions from '../../../../reducers/loading/loading.actions';

@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.scss'],
})
export class InformacionComponent implements OnInit {
  @Input() pedido: PedidoDB;
  cliente: UsuariosDB;
  formaEditar: FormGroup;
  formaInfo: FormGroup;
  displayDialogEditar = false;

  prioridades: Array<PrioridadDB> = [];
  etapas: Array<EtapaDB> = [];
  diseniadores: Array<UsuarioWorker> = [];
  colores: Array<ColorDB> = [];
  origenes: Array<any> = [];
  vendedores: Array<any> = [];
  sucursales: Array<SucursalDB>;

  contatorTime = 0;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private sService: SucursalService,
    private clienteService: ClientesService,
    private validadores: Validaciones,
    private userService: UserService,
    private prioridadService: PrioridadService,
    private etapaService: EtapasService,
    private coloresService: ColorService,
    private origenService: OrigenPedidoService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.crearFormularioInfo();
    this.crearFormularioEditarCliente();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const time = timer(0, 1000).subscribe((resp) => {
      this.store
        .select('login')
        .pipe(take(10))
        .subscribe((usuario) => {
          // console.log(this.pedido);
          this.contatorTime++;

          const fechaRegistro = () => {
            this.formaInfo.controls.fechaRegistro.disable();
            this.formaInfo.controls.fechaRegistro.setValue(
              this.pedido?.fechaRegistro
            );
          };

          const fechaEntrega = () => {
            this.formaInfo.controls.fechaEntrega.setValue(
              this.pedido?.fechaEntrega
            );
          };

          const prioridad = () => {
            const data = {
              token: usuario.token,
              colPrioridad: environment.colPrioridad,
            };
            this.prioridadService
              .obtenerPrioridadesOrdenadas(data)
              .subscribe((pOrdenadas: PrioridadOrdenada) => {
                const pOrds = pOrdenadas.prioridadesOrdenadaDB.prioridades;
                this.prioridades = pOrds;

                const pOrd = pOrds.find(
                  (pOrd) => pOrd._id === this.pedido?.prioridad?._id
                );

                this.formaInfo.controls.prioridad.setValue(pOrd);
              });
          };

          const etapa = () => {
            const data = {
              token: usuario.token,
              colEtapas: environment.colEtapas,
            };

            this.etapaService
              .obtenerEtapasOrdenadas(data)
              .subscribe((etapasOrds: EtapaOrdenada) => {
                const etOrds = etapasOrds.etapasOrdenadaDB.etapas;
                this.etapas = etOrds;

                const eOrd = etOrds.find(
                  (eOrd) => eOrd._id === this.pedido?.etapa?._id
                );

                this.formaInfo.controls.etapa.setValue(eOrd);
              });
          };

          const diseniador = () => {
            this.userService
              .obtenerUsuarios(usuario.token)
              .subscribe((usuarios: Usuario) => {
                const usersDise = usuarios.usuariosDB.filter(
                  (user) => user?.role?.diseniador
                );
                this.diseniadores = usersDise;

                const userDise = usersDise.find(
                  (userDise) => userDise._id === this.pedido?.diseniador?._id
                );

                this.formaInfo.controls.diseniador.setValue(userDise);
              });
          };

          const color = () => {
            this.coloresService
              .obtenerColores(usuario.token)
              .subscribe((colores: Colores) => {
                this.colores = colores.coloresDB;

                const col = colores.coloresDB.find(
                  (color) => color._id === this.pedido?.color?._id
                );

                this.formaInfo.controls.color.setValue(col);
              });
          };

          const origen = () => {
            this.origenService
              .obtenerOrigenes(usuario.token)
              .subscribe((origenes: OrigenPedido) => {
                this.origenes = origenes.origenesDB;

                const org = origenes.origenesDB.find(
                  (org) => org._id === this.pedido?.origen?._id
                );

                this.formaInfo.controls.origen.setValue(org);
              });
          };

          const vendedor = () => {
            this.userService
              .obtenerUsuarios(usuario.token)
              .subscribe((usuarios: Usuario) => {
                const usersVend = usuarios.usuariosDB.filter(
                  (user) => user?.role?.vendedor
                );
                this.vendedores = usersVend;

                const userVend = usersVend.find(
                  (userVend) => userVend._id === this.pedido?.vendedor?._id
                );

                this.formaInfo.controls.vendedor.setValue(userVend);
              });
          };

          const sucursal = () => {
            this.sService
              .obtenerSucs(usuario.token)
              .subscribe((sucursales: Sucursal) => {
                this.sucursales = sucursales.sucursalesDB;

                const suc = sucursales.sucursalesDB.find(
                  (suc) => suc._id === this.pedido?.sucursal?._id
                );

                this.formaInfo.controls.sucursal.setValue(suc);
              });
          };

          fechaRegistro();
          fechaEntrega();
          prioridad();
          etapa();
          diseniador();
          color();
          origen();
          vendedor();
          sucursal();

          if (this.pedido) {
            time.unsubscribe();
          }

          if (this.contatorTime > 11) {
            time.unsubscribe();
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
              this.sucursales = sucursales?.sucursalesDB;
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

  crearFormularioEditarCliente(): void {
    this.formaEditar = this.fb.group({
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

  cargarFormularioEditarCliente(): void {
    const cliente: UsuariosDB = this.pedido.cliente;

    if (cliente) {
      let mapSucursal = null;
      if (cliente.sucursal) {
        mapSucursal = this.sucursales.find(
          (sucursal) => sucursal?._id === cliente.sucursal?._id
        );
      }

      this.formaEditar.controls.sucursales.setValue(mapSucursal);
      this.formaEditar.controls.nombre.setValue(cliente.nombre);
      this.formaEditar.controls.cedula.setValue(
        cliente.cedula || cliente.identificacion
      );
      this.formaEditar.controls.ruc.setValue(cliente.ruc);
      this.formaEditar.controls.telefono.setValue(cliente.telefono);
      this.formaEditar.controls.correo.setValue(cliente.correo);
      this.formaEditar.controls.observacion.setValue(cliente.observacion);
      this.formaEditar.controls.estado.setValue(cliente.estado);
    }
  }

  crearFormularioInfo(): void {
    this.formaInfo = this.fb.group({
      fechaRegistro: [],
      fechaEntrega: [],
      prioridad: [],
      etapa: [],
      diseniador: [],
      color: [],
      origen: [],
      vendedor: [],
      sucursal: [],
    });
  }

  showDialog() {
    this.cargarSucursales();
    this.cargarFormularioEditarCliente();
    this.displayDialogEditar = true;
  }

  closeDialog(): void {
    this.displayDialogEditar = false;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.formaEditar.controls.sucursales.reset();
    this.formaEditar.controls.nombre.reset();
    this.formaEditar.controls.cedula.reset();
    this.formaEditar.controls.ruc.reset();
    this.formaEditar.controls.telefono.reset();
    this.formaEditar.controls.correo.reset();
    this.formaEditar.controls.observacion.reset();
  }

  get validarSucursal(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.sucursales,
      value: this.formaEditar.controls.sucursales.value,
    });
  }

  get validarNombre(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: true,
      size: true,
      minSize: 2,
      maxSize: 20,
      value: this.formaEditar.controls.nombre.value,
    });
  }

  get validarCedula(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      size: true,
      minSize: 0,
      maxSize: 15,
      value: this.formaEditar.controls.cedula.value,
    });
  }

  get validarRuc(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      size: true,
      minSize: 0,
      maxSize: 15,
      value: this.formaEditar.controls.ruc.value,
    });
  }

  get validarTelefono(): ValidarTexto {
    return this.validadores.validarNumber({
      requerido: true,
      size: false,
      value: this.formaEditar.controls.telefono.value,
    });
  }

  get validarCorreo(): ValidarTexto {
    return this.validadores.validarCorreo({
      requerido: false,
      value: this.formaEditar.controls.correo.value,
    });
  }

  get validarObservacion(): ValidarTexto {
    return this.validadores.validarTexto({
      requerido: false,
      value: this.formaEditar.controls.observacion.value,
    });
  }

  get validarPrioridad(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.prioridades,
      value: this.formaInfo.controls.prioridad.value,
    });
  }

  get validarEtapas(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.etapas,
      value: this.formaInfo.controls.etapa.value,
    });
  }

  get validarVendedor(): ValidarTexto {
    return this.validadores.validarSelect({
      requerido: true,
      opciones: this.vendedores,
      value: this.formaInfo.controls.vendedor.value,
    });
  }

  get validarFechaEntrega(): ValidarTexto {
    return this.validadores.validarFecha({
      requerido: true,
      value: this.formaInfo.controls.fechaEntrega.value,
    });
  }

  btnGuardar(): void {
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
      this.formaEditar.markAllAsTouched();
      return;
    } else {
      this.editarCliente();
    }
  }

  btnGuardarInfo(): void {
    if (
      !this.validarPrioridad.valido ||
      !this.validarEtapas.valido ||
      !this.validarVendedor.valido ||
      !this.validarFechaEntrega.valido
    ) {
      this.formaInfo.markAllAsTouched();
      return;
    } else {
      this.editarInformacionPedido();
    }
  }

  editarCliente(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data: CrearCliente = {
          nombre: this.formaEditar.controls.nombre.value,
          cedula: this.formaEditar.controls.cedula.value,
          ruc: this.formaEditar.controls.ruc.value,
          telefono: this.formaEditar.controls.telefono.value,
          correo: this.formaEditar.controls.correo.value,
          observacion: this.formaEditar.controls.observacion.value,
          sucursal: this.formaEditar.controls.sucursales.value._id,
          estado: this.formaEditar.controls.estado.value,
          token: usuario.token,
          id: this.pedido.cliente._id,
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

  editarInformacionPedido(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        const data = {
          token: usuario.token,
          id: this.pedido._id,
          fechaEntrega: this.formaInfo.controls.fechaEntrega.value,
          prioridad: this.formaInfo.controls.prioridad.value?._id || null,
          etapa: this.formaInfo.controls.etapa.value._id || null,
          diseniador: this.formaInfo.controls.diseniador.value?._id || null,
          color: this.formaInfo.controls.color.value?._id || null,
          origen: this.formaInfo.controls.origen.value?._id || null,
          vendedor: this.formaInfo.controls.vendedor.value?._id || null,
          sucursal: this.formaInfo.controls.sucursal.value?._id || null,
        };

        this.store.dispatch(loadingActions.cargarLoading());
        this.pedidoService.editarInfo(data).subscribe((pedido: Pedido) => {
          // socket
          if (pedido.ok) {
            Swal.fire('Mensaje', 'Pedido editado', 'success');
            this.store.dispatch(loadingActions.quitarLoading());
          } else {
            Swal.fire('Mensaje', 'Error al editar pedido', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }

          if (!pedido) {
            Swal.fire('Mensaje', 'Error al editar pedido', 'error');
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
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
