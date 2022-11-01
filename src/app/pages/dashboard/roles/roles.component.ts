import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, take } from 'rxjs/operators';
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
import { EtapasService } from '../../../services/etapas.service';
import { Etapa, EtapaDB } from '../../../interfaces/etapas';
import { forkJoin } from 'rxjs';
import { SucursalService } from '../../../services/sucursal.service';
import { Sucursal, SucursalDB } from '../../../interfaces/sucursales';
import { Usuario, UsuarioWorker } from '../../../interfaces/resp-worker';
import { PrioridadService } from '../../../services/prioridad.service';
import { environment } from 'src/environments/environment';
import {
  Prioridad,
  PrioridadDB,
  PrioridadOrdenada,
} from '../../../interfaces/prioridad';
import { UserService } from '../../../services/user.service';
import { ColorDB, Colores } from '../../../interfaces/colores';
import { ColorService } from '../../../services/color.service';
import { OrigenPedidoService } from '../../../services/origen-pedido.service';
import { OrigenDB, OrigenPedido } from '../../../interfaces/origen-pedido';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  roles: Array<Role>;
  role: Role;
  restricciones: Restricciones;
  usuario: Usuario;

  displayDialogCrear: boolean = false;
  displayDialogEditar: boolean = false;
  displayDialogRestriccion: boolean = false;

  forma: FormGroup;
  formaRestricciones: FormGroup;
  etapas: Array<EtapaDB> = [];
  sucursales: Array<SucursalDB> = [];
  prioridades: Array<PrioridadDB> = [];
  etapasInfo: Array<EtapaDB> = [];
  diseniadores: Array<UsuarioWorker> = [];
  estados: Array<ColorDB> = [];
  origenes: Array<OrigenDB> = [];
  vendedores: Array<UsuarioWorker> = [];
  sucursalesInfo: Array<SucursalDB> = [];

  constructor(
    private validadores: Validaciones,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private roleWorkerService: RoleWorkerService,
    private etapaService: EtapasService,
    private sucursalService: SucursalService,
    private prioridadesOrdService: PrioridadService,
    private userService: UserService,
    private colorService: ColorService,
    private origenService: OrigenPedidoService
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
      // sidebar
      configuracion: [],
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
      modalidad: [],
      tipoArchivo: [],

      // bandeja
      buscadorGeneral: [],
      bandeja: [],
      crearPedido: [],
      borrarPedido: [],
      verID: [],
      verFecha: [],
      verVendedor: [],
      verCliente: [],
      verTelefono: [],
      verSucursal: [],
      verTotal: [],
      verSaldo: [],
      verPrioridad: [],
      verEtapa: [],
      verEstado: [],
      verDise: [],
      etapasSeleccionadas: [[]],
      sucursalesSeleccionadas: [[]],
      prioridadesSeleccionadas: [[]],
      etapaInfoSeleccionadas: [[]],
      diseniadoresSeleccionados: [[]],
      estadosSeleccionados: [[]],
      // origenesSeleccionados: [[]],
      // vendedoresSeleccionados: [[]],
      // sucursalesInfoSeleccionadas: [[]],
      verPropias: [],

      // pedido
      verPestaniaInfo: [],
      verInfoCliente: [],
      verInfoTelCliente: [],
      verInfoCorreo: [],
      verInfoEditarCliente: [],
      editarFechaEntrega: [],
      editarInfoPrioridad: [],
      editarInfoEtapa: [],
      editarInfoDise: [],
      verInfoDistribucion: [],
      editarInfoEstado: [],
      editarInfoOrigen: [],
      editarInfoVendedor: [],
      editarInfoSucursal: [],

      verPestaniProductos: [],
      verPestaniArchivos: [],
      verPestaniSegs: [],
      verPestaniPagos: [],
    });
  }

  cargarFormularioEditar(): void {
    this.forma.controls.nombre.setValue(this.role.nombre);
    this.forma.controls.estado.setValue(this.role.estado);
    this.forma.controls.vendedor.setValue(this.role.vendedor);
    this.forma.controls.diseniador.setValue(this.role.diseniador);
  }

  cargarFormularioEditarRestricciones(): void {
    //  sidebar
    this.formaRestricciones.controls.bandeja.setValue(
      this.role.restricciones?.sidebar?.bandeja
    );
    this.formaRestricciones.controls.configuracion.setValue(
      this.role.restricciones?.sidebar?.configuracion
    );
    this.formaRestricciones.controls.colaboradores.setValue(
      this.role.restricciones?.sidebar?.colaboradores
    );
    this.formaRestricciones.controls.categorias.setValue(
      this.role.restricciones?.sidebar?.categorias
    );
    this.formaRestricciones.controls.roles.setValue(
      this.role.restricciones?.sidebar?.roles
    );
    this.formaRestricciones.controls.prioridad.setValue(
      this.role.restricciones?.sidebar?.prioridad
    );
    this.formaRestricciones.controls.colores.setValue(
      this.role.restricciones?.sidebar?.colores
    );
    this.formaRestricciones.controls.sucursales.setValue(
      this.role.restricciones?.sidebar?.sucursales
    );
    this.formaRestricciones.controls.clientes.setValue(
      this.role.restricciones?.sidebar?.clientes
    );
    this.formaRestricciones.controls.productos.setValue(
      this.role.restricciones?.sidebar?.productos
    );
    this.formaRestricciones.controls.origen.setValue(
      this.role.restricciones?.sidebar?.origen
    );
    this.formaRestricciones.controls.etapas.setValue(
      this.role.restricciones?.sidebar?.etapas
    );
    this.formaRestricciones.controls.metodos.setValue(
      this.role.restricciones?.sidebar?.metodos
    );
    this.formaRestricciones.controls.modalidad.setValue(
      this.role.restricciones?.sidebar?.modalidad
    );
    this.formaRestricciones.controls.tipoArchivo.setValue(
      this.role.restricciones?.sidebar?.tipoArchivo
    );

    // bandeja
    this.formaRestricciones.controls.buscadorGeneral.setValue(
      this.role.restricciones?.bandeja?.buscadorGeneral
    );
    this.formaRestricciones.controls.crearPedido.setValue(
      this.role.restricciones?.bandeja?.crearPedido
    );
    this.formaRestricciones.controls.borrarPedido.setValue(
      this.role.restricciones?.bandeja?.borrarPedido
    );
    this.formaRestricciones.controls.verID.setValue(
      this.role.restricciones?.bandeja?.verID
    );
    this.formaRestricciones.controls.verFecha.setValue(
      this.role.restricciones?.bandeja?.verFecha
    );
    this.formaRestricciones.controls.verVendedor.setValue(
      this.role.restricciones?.bandeja?.verVendedor
    );
    this.formaRestricciones.controls.verCliente.setValue(
      this.role.restricciones?.bandeja?.verCliente
    );
    this.formaRestricciones.controls.verTelefono.setValue(
      this.role.restricciones?.bandeja?.verTelefono
    );
    this.formaRestricciones.controls.verSucursal.setValue(
      this.role.restricciones?.bandeja?.verSucursal
    );
    this.formaRestricciones.controls.verTotal.setValue(
      this.role.restricciones?.bandeja?.verTotal
    );
    this.formaRestricciones.controls.verSaldo.setValue(
      this.role.restricciones?.bandeja?.verSaldo
    );
    this.formaRestricciones.controls.verPrioridad.setValue(
      this.role.restricciones?.bandeja?.verPrioridad
    );
    this.formaRestricciones.controls.verEtapa.setValue(
      this.role.restricciones?.bandeja?.verEtapa
    );
    this.formaRestricciones.controls.verEstado.setValue(
      this.role.restricciones?.bandeja?.verEstado
    );
    this.formaRestricciones.controls.verDise.setValue(
      this.role.restricciones?.bandeja?.verDise
    );
    this.formaRestricciones.controls.etapasSeleccionadas.setValue(
      this.role.restricciones?.bandeja?.etapas
    );
    this.formaRestricciones.controls.sucursalesSeleccionadas.setValue(
      this.role.restricciones?.bandeja?.sucursales
    );
    this.formaRestricciones.controls.verPropias.setValue(
      this.role.restricciones?.bandeja?.verPropias
    );

    // pedido - informacion
    this.formaRestricciones.controls.verPestaniaInfo.setValue(
      this.role.restricciones?.pedido?.informacion?.verInfo
    );
    this.formaRestricciones.controls.verInfoCliente.setValue(
      this.role.restricciones?.pedido?.informacion?.verCliente
    );
    this.formaRestricciones.controls.verInfoTelCliente.setValue(
      this.role.restricciones?.pedido?.informacion?.verTelefono
    );
    this.formaRestricciones.controls.verInfoCorreo.setValue(
      this.role.restricciones?.pedido?.informacion?.verCorreo
    );
    this.formaRestricciones.controls.verInfoEditarCliente.setValue(
      this.role.restricciones?.pedido?.informacion?.editarCliente
    );
    this.formaRestricciones.controls.editarFechaEntrega.setValue(
      this.role.restricciones?.pedido?.informacion?.editarFechaEntrega
    );
    this.formaRestricciones.controls.editarInfoPrioridad.setValue(
      this.role.restricciones?.pedido?.informacion?.editarFechaEntrega
    );
    this.formaRestricciones.controls.prioridadesSeleccionadas.setValue(
      this.role.restricciones?.pedido?.informacion?.prioridad?.disponibles
    );
    this.formaRestricciones.controls.editarInfoEtapa.setValue(
      this.role.restricciones?.pedido?.informacion?.etapa?.editar
    );
    this.formaRestricciones.controls.etapaInfoSeleccionadas.setValue(
      this.role.restricciones?.pedido?.informacion?.etapa?.disponibles
    );
    this.formaRestricciones.controls.editarInfoDise.setValue(
      this.role.restricciones?.pedido?.informacion?.diseniador?.editar
    );
    this.formaRestricciones.controls.verInfoDistribucion.setValue(
      this.role.restricciones?.pedido?.informacion?.diseniador?.verDistribucion
    );
    this.formaRestricciones.controls.diseniadoresSeleccionados.setValue(
      this.role.restricciones?.pedido?.informacion?.diseniador?.disponibles
    );
    this.formaRestricciones.controls.editarInfoEstado.setValue(
      this.role.restricciones?.pedido?.informacion?.estado?.editar
    );
    this.formaRestricciones.controls.estadosSeleccionados.setValue(
      this.role.restricciones?.pedido?.informacion?.estado?.disponibles
    );
    this.formaRestricciones.controls.editarInfoOrigen.setValue(
      this.role.restricciones?.pedido?.informacion?.origen?.editar
    );
    this.formaRestricciones.controls.editarInfoVendedor.setValue(
      this.role.restricciones?.pedido?.informacion?.vendedor?.editar
    );
    this.formaRestricciones.controls.editarInfoSucursal.setValue(
      this.role.restricciones?.pedido?.informacion?.sucursal?.editar
    );

    // pedido pestañas
    this.formaRestricciones.controls.verPestaniProductos.setValue(
      this.role.restricciones?.pedido?.productos
    );
    this.formaRestricciones.controls.verPestaniArchivos.setValue(
      this.role.restricciones?.pedido?.archivos
    );
    this.formaRestricciones.controls.verPestaniSegs.setValue(
      this.role.restricciones?.pedido?.seguimiento
    );
    this.formaRestricciones.controls.verPestaniPagos.setValue(
      this.role.restricciones?.pedido?.pagos
    );
  }

  cargarRoles(): void {
    this.store.dispatch(loadingActions.cargarLoading());
    this.store
      .select('login')
      // .pipe(first())
      .pipe(take(2))
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          this.usuario = usuario;

          const data = {
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.roleWorkerService
            .obtenerRoles(data)
            .subscribe((roles: Roles) => {
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
        }
      });
  }

  cargarCatalogos(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const dataPrior = {
            token: usuario.token,
            colPrioridad: environment.colPrioridad,
            foranea: '',
          };

          const data = {
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
            dataPrior.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
            dataPrior.foranea = usuario.usuarioDB.foranea;
          }

          const getEtapas = this.etapaService.obtenerEtapas(data);
          const getSucs = this.sucursalService.obtenerSucs(data);
          const getPrioridades =
            this.prioridadesOrdService.obtenerPrioridadesOrdenadas(dataPrior);
          const getDise = this.userService.obtenerUsuarios(data);
          const getColores = this.colorService.obtenerColores(data);
          const getOrigenes = this.origenService.obtenerOrigenes(data);
          const getVendedores = this.userService.obtenerUsuarios(data);

          forkJoin([
            getEtapas,
            getSucs,
            getPrioridades,
            getDise,
            getColores,
            getOrigenes,
            getVendedores,
          ]).subscribe(
            (
              resp: [
                Etapa,
                Sucursal,
                PrioridadOrdenada,
                Usuario,
                Colores,
                OrigenPedido,
                Usuario
              ]
            ) => {
              this.etapas = resp[0].etapasDB;
              this.etapasInfo = resp[0].etapasDB;
              this.sucursales = resp[1].sucursalesDB;
              this.prioridades = resp[2].prioridadesOrdenadaDB?.prioridades;
              const arrayDise: Array<UsuarioWorker> = resp[3].usuariosDB;
              this.estados = resp[4].coloresDB;
              this.origenes = resp[5].origenesDB;
              const arrayVend: Array<UsuarioWorker> = resp[6].usuariosDB;
              this.sucursalesInfo = resp[1].sucursalesDB;

              this.diseniadores = arrayDise.filter(
                (user) => user?.role?.diseniador
              );

              this.vendedores = arrayVend.filter(
                (user) => user?.role?.vendedor
              );
            }
          );
        }
      });
  }

  showDialog(tipo: string, role?: any) {
    this.role = role;
    if (!tipo) {
      tipo = 'crear';
    }

    // console.log(role);

    if (tipo === 'crear') {
      this.displayDialogCrear = true;
    } else if (tipo === 'editar') {
      this.cargarFormularioEditar();
      this.displayDialogEditar = true;
    } else if (tipo === 'restricciones') {
      this.displayDialogRestriccion = true;
      this.cargarFormularioEditarRestricciones();
      this.cargarCatalogos();
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
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearRole = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            vendedor: this.forma.controls.vendedor.value,
            diseniador: this.forma.controls.diseniador.value,
            token: usuario.token,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.roleWorkerService.crearRole(data).subscribe((role: Roles) => {
            if (role.ok) {
              this.displayDialogCrear = false;
              Swal.fire('Mensaje', 'Role creado', 'success');
              this.cargarRoles();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', `${role?.err?.message}`, 'error');
            }

            if (!role) {
              Swal.fire('Mensaje', 'Error al crear role', 'error');
            }
          });
        }
      });
  }

  editarRole(): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const data: CrearRole = {
            nombre: this.forma.controls.nombre.value,
            estado: this.forma.controls.estado.value,
            vendedor: this.forma.controls.vendedor.value,
            diseniador: this.forma.controls.diseniador.value,
            token: usuario.token,
            id: this.role._id,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.roleWorkerService.editarRole(data).subscribe((roles: Roles) => {
            if (roles.ok) {
              this.displayDialogEditar = false;
              Swal.fire('Mensaje', 'Role editado', 'success');
              this.cargarRoles();
              this.limpiarFormulario();
            } else {
              Swal.fire('Mensaje', `${roles?.err?.message}`, 'error');
            }

            if (!roles) {
              Swal.fire('Mensaje', 'Error al editar role', 'error');
            }
          });
        }
      });
  }

  editarRestricciones(): void {

    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const restricciones: Restricciones = {
            sidebar: {
              bandeja: this.formaRestricciones.controls.bandeja.value,
              configuracion:
                this.formaRestricciones.controls.configuracion.value,
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
              modalidad: this.formaRestricciones.controls.modalidad.value,
              tipoArchivo: this.formaRestricciones.controls.tipoArchivo.value,
            },
            bandeja: {
              buscadorGeneral:
                this.formaRestricciones.controls.buscadorGeneral.value,
              crearPedido: this.formaRestricciones.controls.crearPedido.value,
              borrarPedido: this.formaRestricciones.controls.borrarPedido.value,
              verID: this.formaRestricciones.controls.verID.value,
              verFecha: this.formaRestricciones.controls.verFecha.value,
              verVendedor: this.formaRestricciones.controls.verVendedor.value,
              verCliente: this.formaRestricciones.controls.verCliente.value,
              verTelefono: this.formaRestricciones.controls.verTelefono.value,
              verSucursal: this.formaRestricciones.controls.verSucursal.value,
              verTotal: this.formaRestricciones.controls.verTotal.value,
              verSaldo: this.formaRestricciones.controls.verSaldo.value,
              verPrioridad: this.formaRestricciones.controls.verPrioridad.value,
              verEtapa: this.formaRestricciones.controls.verEtapa.value,
              verEstado: this.formaRestricciones.controls.verEstado.value,
              verDise: this.formaRestricciones.controls.verDise.value,
              etapas:
                this.formaRestricciones.controls.etapasSeleccionadas.value,
              sucursales:
                this.formaRestricciones.controls.sucursalesSeleccionadas.value,
              verPropias: this.formaRestricciones.controls.verPropias.value,
            },
            pedido: {
              informacion: {
                verInfo: this.formaRestricciones.controls.verPestaniaInfo.value,
                verCliente:
                  this.formaRestricciones.controls.verInfoCliente.value,
                verTelefono:
                  this.formaRestricciones.controls.verInfoTelCliente.value,
                verCorreo: this.formaRestricciones.controls.verInfoCorreo.value,
                editarCliente:
                  this.formaRestricciones.controls.verInfoEditarCliente.value,
                editarFechaEntrega:
                  this.formaRestricciones.controls.editarFechaEntrega.value,
                prioridad: {
                  editar:
                    this.formaRestricciones.controls.editarInfoPrioridad.value,
                  disponibles:
                    this.formaRestricciones.controls.prioridadesSeleccionadas
                      .value,
                },
                etapa: {
                  editar:
                    this.formaRestricciones.controls.editarInfoEtapa.value,
                  disponibles:
                    this.formaRestricciones.controls.etapaInfoSeleccionadas
                      .value,
                },
                diseniador: {
                  editar: this.formaRestricciones.controls.editarInfoDise.value,
                  disponibles:
                    this.formaRestricciones.controls.diseniadoresSeleccionados
                      .value,
                  verDistribucion:
                    this.formaRestricciones.controls.verInfoDistribucion.value,
                },
                estado: {
                  editar:
                    this.formaRestricciones.controls.editarInfoEstado.value,
                  disponibles:
                    this.formaRestricciones.controls.estadosSeleccionados.value,
                },
                origen: {
                  editar:
                    this.formaRestricciones.controls.editarInfoOrigen.value,
                },
                vendedor: {
                  editar:
                    this.formaRestricciones.controls.editarInfoVendedor.value,
                },
                sucursal: {
                  editar:
                    this.formaRestricciones.controls.editarInfoSucursal.value,
                },
              },
              productos:
                this.formaRestricciones.controls.verPestaniProductos.value,
              archivos:
                this.formaRestricciones.controls.verPestaniArchivos.value,
              seguimiento:
                this.formaRestricciones.controls.verPestaniSegs.value,
              pagos: this.formaRestricciones.controls.verPestaniPagos.value,
            },
          };
          const data = {
            token: usuario.token,
            id: this.role._id,
            foranea: '',
            restricciones,
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.roleWorkerService
            .editarRestricciones(data)
            .subscribe((roles: Roles) => {
              if (roles.ok) {
                this.displayDialogRestriccion = false;
                Swal.fire('Mensaje', 'Restricciones editadas', 'success');
                this.cargarRoles();
                this.limpiarFormulario();
              } else {
                Swal.fire('Mensaje', `${roles?.err?.message}`, 'error');
              }

              if (!roles) {
                Swal.fire('Mensaje', 'Error al editar restricciones', 'error');
              }
            });
        }
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
        this.store
          .select('login')
          // .pipe(first())
          .subscribe((usuario) => {
            if (usuario.usuarioDB) {
              const data = {
                id: role._id,
                token: usuario.token,
                foranea: '',
              };

              if (usuario.usuarioDB.empresa) {
                data.foranea = usuario.usuarioDB._id;
              } else {
                data.foranea = usuario.usuarioDB.foranea;
              }

              this.roleWorkerService
                .eliminarRole(data)
                .subscribe((role: Roles) => {
                  if (role.ok) {
                    Swal.fire('Mensaje', 'Role borrado', 'success');
                    this.cargarRoles();
                    this.limpiarFormulario();
                  } else {
                    Swal.fire('Mensaje', 'Error al borrar role', 'error');
                  }

                  if (!role) {
                    Swal.fire('Mensaje', 'Error al borrar role', 'error');
                  }
                });
            }
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
  foranea: string;
}
