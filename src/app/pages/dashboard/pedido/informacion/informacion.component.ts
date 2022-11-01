import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { Validaciones, ValidarTexto } from '../../../../classes/validaciones';
import { Cliente, UsuariosDB } from '../../../../interfaces/clientes';
import { ColorDB, Colores } from '../../../../interfaces/colores';
import { EtapaDB, EtapaOrdenada } from '../../../../interfaces/etapas';
import { OrigenPedido } from '../../../../interfaces/origen-pedido';
import { Pedido, PedidoDB } from '../../../../interfaces/pedido';
import {
  PrioridadDB,
  PrioridadOrdenada,
} from '../../../../interfaces/prioridad';
import { Usuario, UsuarioWorker } from '../../../../interfaces/resp-worker';
import { Sucursal, SucursalDB } from '../../../../interfaces/sucursales';
import { AppState } from '../../../../reducers/globarReducers';
import { ClientesService } from '../../../../services/clientes.service';
import { ColorService } from '../../../../services/color.service';
import { EtapasService } from '../../../../services/etapas.service';
import { OrigenPedidoService } from '../../../../services/origen-pedido.service';
import { PedidoService } from '../../../../services/pedido.service';
import { PrioridadService } from '../../../../services/prioridad.service';
import { SucursalService } from '../../../../services/sucursal.service';
import { UserService } from '../../../../services/user.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as loadingActions from '../../../../reducers/loading/loading.actions';
import * as moment from 'moment';
import * as _ from 'lodash';
import { FiltrarEstados } from '../../../../classes/filtrar-estados';
import { CSocketService } from '../../../../services/sockets/c-socket.service';

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
  displayDialogDist = false;
  displayDialogHist = false;
  usuario: UsuarioWorker;

  prioridades: Array<PrioridadDB> = [];
  etapas: Array<EtapaDB> = [];
  etapasOrds: Array<EtapaDB> = [];
  diseniadores: Array<UsuarioWorker> = [];
  colores: Array<ColorDB> = [];
  estados: Array<ColorDB> = [];
  origenes: Array<any> = [];
  vendedores: Array<any> = [];
  sucursales: Array<SucursalDB>;
  distribucion: Array<any> = [];
  historiales: Array<any> = [];

  contatorTime = 0;

  items: Array<any> = [];

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
    private pedidoService: PedidoService,
    private filtrarEstadosCat: FiltrarEstados,
    private clienteSocket: CSocketService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.crearFormularioInfo();
    this.crearFormularioEditarCliente();
    this.cargarCatalogos();
    this.botonAcciones();
    this.cargarPedidoSocket();
  }

  cargarCatalogos(): void {
    const time = timer(0, 1000).subscribe((resp) => {
      this.store
        .select('login')
        // .pipe(take(10))
        // .pipe(first())
        .subscribe((usuario) => {
          if (usuario.usuarioDB) {
            this.usuario = usuario.usuarioDB;
            // console.log(this.usuario);
            // console.log(
            //   this.usuario?.role?.restricciones?.pedido?.informacion?.verCliente
            // );

            if (!this.pedido) {
              return;
            }
            this.contatorTime++;

            const fechaRegistro = () => {
              this.formaInfo.controls.fechaRegistro.disable();
              this.formaInfo.controls.fechaRegistro.setValue(
                this.pedido?.fechaRegistro
              );
            };

            const fechaEntrega = () => {
              if (
                !this.usuario?.role?.restricciones?.pedido?.informacion
                  ?.editarFechaEntrega
              ) {
                this.formaInfo.controls.fechaEntrega.disable();
              }
              this.formaInfo.controls.fechaEntrega.setValue(
                this.pedido?.fechaEntrega
              );
            };

            const prioridad = () => {
              const data = {
                token: usuario.token,
                colPrioridad: environment.colPrioridad,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }
              this.prioridadService
                .obtenerPrioridadesOrdenadas(data)
                .subscribe((pOrdenadas: PrioridadOrdenada) => {
                  const pOrds = this.filtrarEstadosCat.filtrarActivos(
                    pOrdenadas.prioridadesOrdenadaDB.prioridades
                  );
                  // const pOrds = pOrdenadas.prioridadesOrdenadaDB.prioridades;
                  this.prioridades = pOrds;

                  const pOrd = pOrds.find(
                    (pOrd) => pOrd._id === this.pedido?.prioridad?._id
                  );

                  if (
                    !usuario?.usuarioDB?.role?.restricciones?.pedido
                      ?.informacion?.prioridad?.editar
                  ) {
                    this.formaInfo.controls.prioridad.disable();
                  }
                  this.formaInfo.controls.prioridad.setValue(pOrd);
                });
            };

            const etapa = () => {
              const data = {
                token: usuario.token,
                colEtapas: environment.colEtapas,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.etapaService
                .obtenerEtapasOrdenadas(data)
                .subscribe((etapasOrds: EtapaOrdenada) => {
                  // this.etapasOrds = this.filtrarEstadosCat.filtrarActivos(
                  //   etapasOrds.etapasOrdenadaDB.etapas
                  // );

                  // console.log(this.etapasOrds);
                  // this.etapasOrds = etapasOrds.etapasOrdenadaDB.etapas;

                  const etUser: Array<EtapaDB> =
                    this.usuario.role.restricciones.pedido.informacion.etapa
                      .disponibles;

                  const etapaPedido = this.pedido.etapa;

                  const mapEtapas: Array<EtapaDB> = _.uniqBy(
                    [...etUser, etapaPedido],
                    '_id'
                  );

                  const eOrd = mapEtapas.find(
                    (eOrd) => eOrd._id === this.pedido?.etapa?._id
                  );

                  this.etapas =
                    this.filtrarEstadosCat.filtrarActivos(mapEtapas);

                  if (
                    !this.usuario?.role?.restricciones?.pedido?.informacion
                      ?.etapa?.editar
                  ) {
                    this.formaInfo.controls.etapa.disable();
                  }
                  this.formaInfo.controls.etapa.setValue(eOrd);
                });
            };

            const diseniador = () => {
              const data = {
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }
              this.userService
                .obtenerUsuarios(data)
                .subscribe((usuarios: Usuario) => {
                  const usersDise = usuarios.usuariosDB.filter(
                    (user) => user?.role?.diseniador
                  );
                  this.diseniadores =
                    this.filtrarEstadosCat.filtrarActivos(usersDise);

                  const userDise = usersDise.find(
                    (userDise) => userDise._id === this.pedido?.diseniador?._id
                  );

                  if (
                    !usuario?.usuarioDB?.role?.restricciones?.pedido
                      ?.informacion?.diseniador?.editar
                  ) {
                    this.formaInfo.controls.diseniador.disable();
                  }
                  this.formaInfo.controls.diseniador.setValue(userDise);
                  // console.log(userDise);
                });
            };

            const color = () => {
              const data = {
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.coloresService
                .obtenerColores(data)
                .subscribe((colores: Colores) => {
                  this.estados = colores.coloresDB;
                  const esUser: Array<ColorDB> =
                    this.usuario.role.restricciones.pedido.informacion.estado
                      .disponibles;

                  const estadoPedido = this.pedido.color;

                  const mapEstados: Array<ColorDB> = _.uniqBy(
                    [...esUser, estadoPedido],
                    '_id'
                  );

                  this.colores =
                    this.filtrarEstadosCat.filtrarActivos(mapEstados);

                  if (
                    !usuario?.usuarioDB?.role?.restricciones?.pedido
                      ?.informacion?.estado?.editar
                  ) {
                    this.formaInfo.controls.color.disable();
                  }

                  if (this.pedido.color) {
                    const col = mapEstados.find(
                      (color) => color._id === this.pedido?.color?._id
                    );

                    this.formaInfo.controls.color.setValue(col);
                  }
                });
            };

            const origen = () => {
              const data = {
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.origenService
                .obtenerOrigenes(data)
                .subscribe((origenes: OrigenPedido) => {
                  const origActivos = this.filtrarEstadosCat.filtrarActivos(
                    origenes.origenesDB
                  );
                  this.origenes = origActivos;

                  const org = origenes.origenesDB.find(
                    (org) => org._id === this.pedido?.origen?._id
                  );

                  if (
                    !usuario?.usuarioDB?.role?.restricciones?.pedido
                      ?.informacion?.origen.editar
                  ) {
                    this.formaInfo.controls.origen.disable();
                  }

                  this.formaInfo.controls.origen.setValue(org);
                });
            };

            const vendedor = () => {
              const data = {
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.userService
                .obtenerUsuarios(data)
                .subscribe((usuarios: Usuario) => {
                  const usersVend = usuarios.usuariosDB.filter(
                    (user) => user?.role?.vendedor
                  );
                  this.vendedores =
                    this.filtrarEstadosCat.filtrarActivos(usersVend);

                  const userVend = usersVend.find(
                    (userVend) => userVend._id === this.pedido?.vendedor?._id
                  );

                  if (
                    !usuario?.usuarioDB?.role?.restricciones?.pedido
                      ?.informacion?.vendedor?.editar
                  ) {
                    this.formaInfo.controls.vendedor.disable();
                  }
                  this.formaInfo.controls.vendedor.setValue(userVend);
                });
            };

            const sucursal = () => {
              const data = {
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.sService
                .obtenerSucs(data)
                .subscribe((sucursales: Sucursal) => {
                  const sucActivas = this.filtrarEstadosCat.filtrarActivos(
                    sucursales.sucursalesDB
                  );
                  this.sucursales = sucActivas;

                  const suc = sucursales.sucursalesDB.find(
                    (suc) => suc._id === this.pedido?.sucursal?._id
                  );

                  if (
                    !usuario?.usuarioDB?.role?.restricciones?.pedido
                      ?.informacion?.sucursal?.editar
                  ) {
                    this.formaInfo.controls.sucursal.disable();
                  }
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
          }
        });
    });
  }

  filtrarEtapas(): void {
    const etapasRole: Array<EtapaDB> =
      this.usuario?.role?.restricciones?.pedido?.informacion?.etapa
        ?.disponibles;

    const etapas: Array<EtapaDB> = this.etapasOrds;

    this.etapas = etapasRole.filter((etapa) => {
      return etapas.map((etapaRole) => {
        return etapa._id === etapaRole._id;
      });
    });

    this.etapas = this.filtrarEstadosCat.filtrarActivos(this.etapas);
  }

  filtrarEstados(): void {
    const estadosRole: Array<ColorDB> =
      this.usuario?.role?.restricciones?.pedido?.informacion?.estado
        ?.disponibles;

    const estados: Array<ColorDB> = this.estados;

    this.colores = estadosRole.filter((color) => {
      return estados.map((estadoRole) => {
        return color._id === estadoRole._id;
      });
    });

    this.colores = this.filtrarEstadosCat.filtrarActivos(this.colores);
  }

  cargarDistribucion(): void {
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

          this.userService.obtenerDistribucion(data).subscribe((resp) => {
            if (resp.ok) {
              this.distribucion = resp.distDB;
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire(
                'Mensaje',
                'Error al cargar la distribución de pedidos',
                'error'
              );
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!resp) {
              this.store.dispatch(loadingActions.quitarLoading());
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
        }
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

  obtenerPedido(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            id: this.pedido._id,
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.pedidoService.obtenerPedido(data).subscribe((pedido: Pedido) => {
            this.pedido = pedido.pedidoDB;

            // console.log(this.pedido);
          });
        }
      });
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
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
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
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.clienteService
            .editarCliente(data)
            .subscribe((cliente: Cliente) => {
              if (cliente.ok) {
                this.displayDialogEditar = false;
                Swal.fire('Mensaje', 'Cliente editado', 'success');

                this.limpiarFormulario();
                this.store.dispatch(loadingActions.quitarLoading());
              } else {
                Swal.fire('Mensaje', 'Error al editar cliente', 'error');
                this.store.dispatch(loadingActions.quitarLoading());
              }

              if (!cliente) {
                Swal.fire('Mensaje', 'Error al editar cliente', 'error');
                this.store.dispatch(loadingActions.quitarLoading());
              }
            });
        }
      });
  }

  editarInformacionPedido(): void {
    if (
      !this.formaInfo.controls.prioridad.value ||
      !this.formaInfo.controls.etapa.value ||
      !this.formaInfo.controls.vendedor.value
    ) {
      this.formaInfo.markAllAsTouched();
      return;
    }

    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            token: usuario.token,
            id: this.pedido._id,
            fechaEntrega: this.formaInfo.controls.fechaEntrega.value,
            prioridad: this.formaInfo.controls.prioridad.value?._id || null,
            etapa: this.formaInfo.controls.etapa.value?._id || null,
            diseniador: this.formaInfo.controls.diseniador.value?._id || null,
            color: this.formaInfo.controls.color.value?._id || null,
            origen: this.formaInfo.controls.origen.value?._id || null,
            vendedor: this.formaInfo.controls.vendedor.value?._id || null,
            sucursal: this.formaInfo.controls.sucursal.value?._id || null,
            archivado: this.pedido.archivado,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.pedidoService.editarInfo(data).subscribe((pedido: Pedido) => {
            if (pedido.ok) {
              this.guardarHistorial();
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
        }
      });
  }

  archivarPedido(): void {
    if (
      !this.formaInfo.controls.prioridad.value ||
      !this.formaInfo.controls.etapa.value ||
      !this.formaInfo.controls.vendedor.value
    ) {
      this.formaInfo.markAllAsTouched();
      return;
    }
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
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
            archivado: true,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.store.dispatch(loadingActions.cargarLoading());
          this.pedidoService.editarInfo(data).subscribe((pedido: Pedido) => {
            // socket
            if (pedido.ok) {
              this.guardarHistorial();

              Swal.fire('Mensaje', 'Pedido archivado', 'success');
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al archivar pedido', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!pedido) {
              Swal.fire('Mensaje', 'Error al archivar pedido', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  desArchivarPedido(): void {
    if (
      !this.formaInfo.controls.prioridad.value ||
      !this.formaInfo.controls.etapa.value ||
      !this.formaInfo.controls.vendedor.value
    ) {
      this.formaInfo.markAllAsTouched();
      return;
    }
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
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
            archivado: false,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.store.dispatch(loadingActions.cargarLoading());
          this.pedidoService.editarInfo(data).subscribe((pedido: Pedido) => {
            // socket
            if (pedido.ok) {
              this.guardarHistorial();

              Swal.fire('Mensaje', 'Pedido desarchivado', 'success');
              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', 'Error al desarchivar pedido', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }

            if (!pedido) {
              Swal.fire('Mensaje', 'Error al desarchivar pedido', 'error');
              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
        }
      });
  }

  mostrarDistribucion(): void {
    this.cargarDistribucion();
    this.displayDialogDist = true;
  }

  guardarHistorial(): void {
    if (
      !this.formaInfo.controls.prioridad.value ||
      !this.formaInfo.controls.etapa.value ||
      !this.formaInfo.controls.vendedor.value
    ) {
      this.formaInfo.markAllAsTouched();
      return;
    }

    const idPrioridad = this.formaInfo.controls.prioridad.value?._id;
    const idEtapa = this.formaInfo.controls.etapa.value._id;
    const idEstado = this.formaInfo.controls.color.value?._id;
    const idVendedor = this.formaInfo.controls.vendedor.value?._id;
    const idDiseniador = this.formaInfo.controls.diseniador.value?._id;

    let estadoPriod = false;
    let estadoEtapa = false;
    let estadoEstado = false;
    let estadoVendedor = false;
    let estadoDiseniador = false;

    idPrioridad === this.pedido?.prioridad?._id
      ? (estadoPriod = true)
      : (estadoPriod = false);
    idEtapa === this.pedido?.etapa?._id
      ? (estadoEtapa = true)
      : (estadoEtapa = false);
    idEstado === this.pedido?.color?._id
      ? (estadoEstado = true)
      : (estadoEstado = false);
    idVendedor === this.pedido?.vendedor?._id
      ? (estadoVendedor = true)
      : (estadoVendedor = false);
    idDiseniador === this.pedido?.diseniador?._id
      ? (estadoDiseniador = true)
      : (estadoDiseniador = false);

    if (
      estadoPriod &&
      estadoEtapa &&
      estadoEstado &&
      estadoVendedor &&
      estadoDiseniador
    ) {
      return;
    }
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            historial: {
              priorOrg: this.pedido?.prioridad?._id,
              etapaOrg: this.pedido?.etapa?._id,
              estadoOrg: this.pedido?.color?._id,
              vendedorOrg: this.pedido?.vendedor?._id,
              diseniadorOrg: this.pedido?.diseniador?._id,
              priorAct: idPrioridad,
              etapaAct: idEtapa,
              estadoAct: idEstado,
              vendedorAct: idVendedor,
              diseniadorAct: idDiseniador,
              fecha: moment().format('DD/MM/YYYY hh:mm a'),
              idPedido: this.pedido._id,
              usuario: usuario.usuarioDB._id,
            },
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.pedidoService.guardarHistorial(data).subscribe();
          this.obtenerPedido();
        }
      });
  }

  obtenerHistorial(): void {
    this.displayDialogHist = true;

    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            token: usuario.token,
            idPedido: this.pedido._id,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.pedidoService.obtenerHistorial(data).subscribe((historial) => {
            this.historiales = historial.historialesDB;
            // console.log(this.historiales);
          });
        }
      });
  }

  botonAcciones(): void {
    let archivarDesactivar;
    const time = timer(0, 300)
      .pipe(take(2))
      .subscribe((resp) => {
        if (this.pedido) {
          if (this.pedido.archivado) {
            archivarDesactivar = {
              label: 'Guardar y Desarchivar',
              icon: 'pi pi-refresh',
              command: () => {
                this.desArchivarPedido();
              },
            };
          } else {
            archivarDesactivar = {
              label: 'Guardar y archivar',
              icon: 'pi pi-save',
              command: () => {
                this.archivarPedido();
              },
            };
          }

          this.items = [
            {
              label: 'Guardar cambios',
              icon: 'pi pi-check',
              command: () => {
                this.editarInformacionPedido();
              },
            },
            archivarDesactivar,
            {
              label: 'Historial de cambios',
              icon: 'pi pi-history',
              command: () => {
                this.obtenerHistorial();
              },
            },
          ];
          time.unsubscribe();
        }
      });
  }

  cargarPedidoSocket(): void {
    this.clienteSocket.escuchar('cargar-pedido').subscribe((resp) => {
      this.store.select('login').subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data = {
            token: usuario.token,
            foranea: '',
            id: this.pedido._id,
          };
          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.pedidoService.obtenerPedido(data).subscribe((pedido: Pedido) => {
            this.pedido = pedido.pedidoDB;
          });
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
  foranea: string;
}
