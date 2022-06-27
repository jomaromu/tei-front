import { ArchivosSocketService } from './../../services/sockets/archivos-socket.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/globarReducers';
import { first, retry, take } from 'rxjs/operators';
import { Pedido, PedidoDB } from '../../interfaces/pedido';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrigenPedidoService } from '../../services/origen-pedido.service';
import { OrigenPedido } from '../../interfaces/origen-pedido';
import { UserService } from '../../services/user.service';
import { UsuarioWorker, Usuario } from '../../interfaces/resp-worker';
import { SucursalService } from '../../services/sucursal.service';
import { SucursalesDB } from '../../interfaces/sucursales';
import * as loadingActions from '../../reducers/loading/loading.actions';
import * as modalActions from '../../reducers/modal/modal.actions';
import Swal from 'sweetalert2';
import { ProductoService } from '../../services/producto.service';
import { ProductoPedidoService } from '../../services/producto-pedido.service';
import {
  Productospedido,
  ProductoPedido,
} from '../../interfaces/producto-pedido';
import { Producto } from '../../interfaces/producto';
import { ProductoDB } from '../../interfaces/producto';
import { ArchivosService } from '../../services/archivos.service';
import { Archivo } from '../../interfaces/archivo';
import { ObjTotales } from '../../reducers/totales-pedido/totales.actions';
import { PagosService } from '../../services/pagos.service';
import { PagoDB } from '../../interfaces/pagos';
import { PagosSocketService } from '../../services/sockets/pagos-socket.service';
import { ProductosPedidoService } from '../../services/sockets/productos-pedido.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { ObjCat } from '../../reducers/alert-editar-cliente/editar.reducer';
import * as editarClienteActions from '../../reducers/alert-editar-cliente/editar.actions';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
})
export class PedidoComponent implements OnInit, OnDestroy {
  @ViewChild('usuarioEtapaView', { static: true })
  usuarioEtapaView: ElementRef<HTMLElement>;
  @ViewChild('placeHolderProducto', { static: true })
  placeHolderProducto: ElementRef<HTMLElement>;
  @ViewChild('checkItbms', { static: true }) checkItbms: ElementRef;
  @ViewChild('inputProducto', { static: true })
  inputProducto: ElementRef<HTMLElement>;
  @ViewChild('segDise', { static: true })
  segDise: ElementRef<HTMLTextAreaElement>;

  pedido: PedidoDB;
  pedidoCompleto: Pedido;
  forma: FormGroup;
  bitacora: any;

  usuarioEtapa: string;
  usuariosEtapa: Array<UsuarioWorker>;
  fechaEntrega: string;
  prioridadesPedido: Array<any>;
  etapasPedido: Array<any>;
  estadosPedido: Array<any>;
  origenes: OrigenPedido;
  diseniadores: Array<UsuarioWorker>;
  vendedores: Array<UsuarioWorker>;
  vendedor = {
    nombre: null,
    _id: null,
  };
  sucursales: Array<SucursalesDB>;
  loading = false;
  productosPedidos: Array<Productospedido>;
  productos: Array<ProductoDB>;
  producto: ProductoDB;
  objTotal: ObjTotales = {
    pedido: 0,
    subtotal: 0,
    itbms: 0,
    pagos: 0,
    total: 0,
  };
  loadModal = false;
  archivo: Archivo;
  diseniadorFake = {
    _id: null,
    nombre: 'Seleccionar',
  };

  pagos: Array<PagoDB>;
  modalidad = [
    { id: 0, nombre: 'Abono' },
    { id: 1, nombre: 'Cancelación' },
    // { id: 2, nombre: 'Delivery' },
  ];

  role: string;
  roleNoPermitido: boolean;
  sub1: Subscription;
  sub2: Subscription;
  bitacoraPedido: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    private origenPedidoService: OrigenPedidoService,
    private productoPedidoService: ProductoPedidoService,
    private userService: UserService,
    private sucursalService: SucursalService,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private http: HttpClient,
    private archivoService: ArchivosService,
    private pagoSocketService: PagosSocketService,
    private productosPedidoSocketService: ProductosPedidoService,
    private pagoService: PagosService,
    private archivoSocketService: ArchivosSocketService
  ) {
    // this.cdref.detectChanges();
  }

  ngOnInit(): void {
    this.cargarFormulario();
    this.obtenerPedido();
    this.cargarArchivos();
    this.obtenerPagosSocket();
    this.obtenerProductosSocket();
    this.cargarArchivosSocket();
  }

  cargarFormulario(): void {
    this.forma = this.fb.group({
      fechaRegistro: [null],
      fechaEntrega: [null],
      etapaPedido: [null],
      estadoPedido: [null],
      prioridad: [null],
      origenVenta: [null],
      diseniador: [null],
      vendedor: [null],
      vendedores: [null],
      sucursal: [null],

      producto: [null],
      comentario: [null],
      precio: [null],
      cantidad: [null],
      itbms: [null],
    });

    this.forma.controls.fechaRegistro.disable();
  }

  // informacion
  obtenerPedido(): void {
    const idPedido = this.route.snapshot.queryParamMap.get('id');

    this.sub1 = this.store
      .select('login')
      .pipe(take(3))
      .subscribe((worker) => {
        this.role = worker?.usuario?.colaborador_role;
        if (
          worker?.usuario?.colaborador_role === 'DiseniadorRole' ||
          worker?.usuario?.colaborador_role === 'DiseniadorVIPRole'
        ) {
          this.roleNoPermitido = true;
        }

        const data = {
          token: worker.token,
          idPedido,
        };

        this.pedidoService
          .obtenerPedido(data)
          .pipe(take(3))
          .subscribe((pedido: Pedido) => {
            // console.log(pedido);
            this.pedido = pedido.pedidoDB;
            this.pedidoCompleto = pedido;
            this.cargarSelects();
            this.cargarProductosPedidos(pedido.pedidoDB);
            this.obtenerPagosPorPedido(pedido.pedidoDB._id);

            const checkItbms: any = this.checkItbms.nativeElement;
            checkItbms.checked = pedido.pedidoDB.itbms;
          });
      });
  }

  cargarSelects(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const role = worker?.usuario?.colaborador_role;

        const cargarFechaEntrega = () => {
          this.forma.controls.fechaEntrega.setValue(this.pedido.fecha_entrega);
          // console.log(this.pedido);

          if (role === 'DiseniadorRole' || role === 'DiseniadorVIPRole') {
            this.forma.controls.fechaEntrega.disable();
          }
        };

        const cargarPrioridad = () => {
          this.http
            .get('../../../assets/prioridad.json')
            .pipe()
            .subscribe((data: any) => {
              this.prioridadesPedido = data;
              this.forma.controls.prioridad.setValue(
                this.pedido.prioridad_pedido
              );

              if (role === 'DiseniadorRole') {
                this.forma.controls.prioridad.disable();
              }
            });
        };

        const cargarEtapa = () => {
          this.http
            .get('../../../assets/etapas.json')
            .pipe()
            .subscribe((data: Array<any>) => {
              // console.log(worker);

              if (
                worker?.usuario?.colaborador_role === 'DiseniadorRole' ||
                worker?.usuario?.colaborador_role === 'DiseniadorVIPRole'
              ) {
                const mapData = data.filter((etapa) => {
                  // console.log(etapa);
                  return etapa.id === 1 || etapa.id === 2;
                });

                this.etapasPedido = mapData;
                this.forma.controls.etapaPedido.setValue(
                  this.pedido.etapa_pedido
                );
              } else if (
                worker?.usuario?.colaborador_role === 'ProduccionVIPRole' ||
                worker?.usuario?.colaborador_role === 'ProduccionNormalRole' ||
                worker?.usuario?.colaborador_role === 'VendedorNormalRole'
              ) {
                const mapData = data.filter((etapa) => {
                  // console.log(etapa);
                  return etapa.id !== 5;
                });

                this.etapasPedido = mapData;
                this.forma.controls.etapaPedido.setValue(
                  this.pedido.etapa_pedido
                );
              } else {
                this.etapasPedido = data;
                this.forma.controls.etapaPedido.setValue(
                  this.pedido.etapa_pedido
                );
              }
            });
        };

        const cargarEstado = () => {
          this.http
            .get('../../../assets/estados.json')
            .pipe()
            .subscribe((data: Array<any>) => {
              // console.log(data);

              if (
                worker?.usuario?.colaborador_role === 'DiseniadorRole' ||
                worker?.usuario?.colaborador_role === 'DiseniadorVIPRole'
              ) {
                const dataMap = data.filter((estado) => {
                  return estado.id === 0 || estado.id === 1 || estado.id === 6;
                });

                this.estadosPedido = dataMap;
                this.forma.controls.estadoPedido.setValue(
                  this.pedido.estado_pedido
                );
              } else if (
                worker?.usuario?.colaborador_role === 'VendedorVIPRole' ||
                worker?.usuario?.colaborador_role === 'VendedorNormalRole'
              ) {
                const dataMap = data.filter((estado) => {
                  return (
                    estado.id === 0 ||
                    estado.id === 2 ||
                    estado.id === 3 ||
                    estado.id === 8 ||
                    estado.id === 9 ||
                    estado.id === 10
                  );
                });

                this.estadosPedido = dataMap;
                this.forma.controls.estadoPedido.setValue(
                  this.pedido.estado_pedido
                );
              } else {
                this.estadosPedido = data;
                this.forma.controls.estadoPedido.setValue(
                  this.pedido.estado_pedido
                );
              }
            });

          // if (role === 'DiseniadorRole') {
          //   this.forma.controls.estadoPedido.disable();
          // }
        };

        const cargarOrigen = () => {
          this.origenPedidoService
            .obtenerOrigenes(worker.token)
            .subscribe((data) => {
              this.origenes = data;
              this.forma.controls.origenVenta.setValue(
                this.pedido.origen_pedido?._id
              ); // Hacer populate en la DB

              if (role === 'DiseniadorRole' || role === 'DiseniadorVIPRole') {
                this.forma.controls.origenVenta.disable();
              }
            });
        };

        const cargarDiseniadores = () => {
          const diseNormal = this.userService.obtenerUsuariosRole(
            worker.token,
            'DiseniadorRole'
          );
          const diseVIP = this.userService.obtenerUsuariosRole(
            worker.token,
            'DiseniadorVIPRole'
          );

          forkJoin([diseNormal, diseVIP]).subscribe((resp) => {
            const diseniadores = {
              ok: true,
              cantidad: resp[0].cantidad + resp[1].cantidad,
              usuariosDB: [...resp[0].usuariosDB, ...resp[1].usuariosDB],
            };
            this.diseniadores = diseniadores.usuariosDB;
          });
          // this.userService
          //   .obtenerUsuariosRole(worker.token, 'DiseniadorRole')
          //   .subscribe((data: any) => {
          //     this.diseniadores = data.usuariosDB;
          //     // this.forma.controls.diseniador.setValue(data.usuariosDB[0]._id);
          //     // console.log(this.diseniadores);
          //   });
        };

        const cargarDiseniador = () => {
          if (!this.pedido.asignado_a) {
            this.forma.controls.diseniador.setValue(this.diseniadorFake._id);
          } else {
            this.forma.controls.diseniador.setValue(this.pedido.asignado_a._id);
          }

          if (role === 'DiseniadorRole') {
            this.forma.controls.diseniador.disable();
          }
        };

        const cargarVendedor = () => {

          if (this.pedido) {
            if (!this.pedido.idCreador) {
              this.vendedor = {
                nombre: 'No asignado',
                _id: '',
              };
              this.forma.controls.vendedor.disable();
            } else {
              this.userService
                .obtenerUsuarioID(this.pedido.idCreador?._id, worker.token)
                .subscribe((data) => {
                  this.vendedor = {
                    nombre: `${data?.usuario?.nombre} ${data.usuario.apellido}`,
                    _id: this.pedido.idCreador._id,
                  };
                  this.forma.controls.vendedor.setValue(this.vendedor?.nombre);
                  this.forma.controls.vendedor.disable();
                });
            }
          }
        };

        const cargarVendedores = () => {
          let creadorPedido: Observable<any>;
          let vendeNormal: Observable<any>;
          let vendeVIP: Observable<any>;

          if (!this.pedido.idCreador) {
            vendeNormal = this.userService.obtenerUsuariosRole(
              worker.token,
              'VendedorNormalRole'
            );
            vendeVIP = this.userService.obtenerUsuariosRole(
              worker.token,
              'VendedorVIPRole'
            );

            forkJoin([vendeNormal, vendeVIP]).subscribe((resp) => {
              const vendedores = {
                ok: true,
                cantidad: resp[0].cantidad + resp[1].cantidad,
                usuariosDB: [...resp[0].usuariosDB, ...resp[1].usuariosDB],
              };

              this.vendedores = vendedores.usuariosDB;

              const arrayVendedors: Array<UsuarioWorker> =
                vendedores.usuariosDB;

              // console.log(this.vendedores);
            });
            return;
          }
          creadorPedido = this.userService.obtenerUsuarioID(
            this.pedido.idCreador?._id,
            worker.token
          );

          vendeNormal = this.userService.obtenerUsuariosRole(
            worker.token,
            'VendedorNormalRole'
          );
          vendeVIP = this.userService.obtenerUsuariosRole(
            worker.token,
            'VendedorVIPRole'
          );

          forkJoin([vendeNormal, vendeVIP, creadorPedido]).subscribe((resp) => {
            const vendedores = {
              ok: true,
              cantidad: resp[0].cantidad + resp[1].cantidad,
              usuariosDB: [
                ...resp[0].usuariosDB,
                ...resp[1].usuariosDB,
                resp[2].usuario,
              ],
            };

            const arrayVendedors: Array<UsuarioWorker> = vendedores.usuariosDB;

            if (this.pedido.idCreador) {
              const vendedorOrig = arrayVendedors.find(
                (vendedor) => vendedor._id === this.pedido.idCreador._id
              );

              const vendedoresOtros = arrayVendedors.filter((vendedor) => {
                return this.pedido.idCreador._id !== vendedor._id;
              });
              this.forma.controls.vendedores.setValue(vendedorOrig?._id);
              this.vendedores = [vendedorOrig, ...vendedoresOtros];
            } else {
              this.vendedores = vendedores.usuariosDB;
            }

            // console.log(this.vendedores);
          });
        };

        const cargarSucursales = () => {
          this.sucursalService
            .obtenerSucursales(worker.token)
            .subscribe((data) => {
              this.sucursales = data.sucursalesDB;
              this.forma.controls.sucursal.setValue(this.pedido.sucursal._id);

              if (role === 'DiseniadorRole' || role === 'DiseniadorVIPRole') {
                this.forma.controls.sucursal.disable();
              }
            });
        };

        cargarFechaEntrega();
        cargarVendedor();
        cargarVendedores();
        cargarPrioridad();
        cargarEtapa();
        cargarEstado();
        cargarOrigen();
        cargarDiseniadores();
        cargarSucursales();
        cargarDiseniador();
      });
  }

  cargarDistribucion(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        this.userService.obtenerDistribucion().subscribe((diseniadores) => {
          this.store.dispatch(
            modalActions.cargarModal({
              tipo: 'ver-diseniadores',
              estado: true,
              data: diseniadores,
            })
          );
        });
      });
  }

  actualizarInfo(tipo: string): void {
    this.store.dispatch(loadingActions.cargarLoading());

    if (this.forma.status === 'VALID') {
      // console.log(this.pedido._id);

      let vendedor: any = '';

      if (
        document.getElementById('vendedor') &&
        !document.getElementById('vendedores')
      ) {
        vendedor = (document.getElementById('vendedor') as HTMLInputElement)
          .dataset.id;
      } else if (
        !document.getElementById('vendedor') &&
        document.getElementById('vendedores')
      ) {
        vendedor = (document.getElementById('vendedores') as HTMLSelectElement)
          .value;
      }

      const data = {
        tipo,
        id: this.pedido._id,
        sucursal: this.forma.controls.sucursal.value,
        etapa_pedido: parseInt(this.forma.controls.etapaPedido.value, 10),
        prioridad_pedido: this.forma.controls.prioridad.value,
        asignado_a: null,
        estado_pedido: this.forma.controls.estadoPedido.value,
        fecha_entrega: this.forma.controls.fechaEntrega.value,
        origen_pedido: this.forma.controls.origenVenta.value,
        idCreador: vendedor,
      };

      // console.log(this.forma.controls.vendedores.value);
      if (this.forma.controls.diseniador.value !== null) {
        data.asignado_a = this.forma.controls.diseniador.value;
      }

      if (data.etapa_pedido === 1 && !data.asignado_a) {
        Swal.fire('Mensaje', `Debe asignar el pedido a un diseñador`, 'error');

        this.store.dispatch(loadingActions.quitarLoading());
      } else {
        // return;

        this.store
          .select('login')
          .pipe(first())
          .subscribe((worker) => {
            this.pedidoService
              .editarPedido(data, worker.token)
              .subscribe((pedidoDB: any) => {
                this.store.dispatch(loadingActions.quitarLoading());

                if (pedidoDB.ok === true) {
                  // Activar Socket
                  this.pedidoService.obtenerPedidos(worker.token).subscribe();

                  Swal.fire('Mensaje', `${pedidoDB.mensaje}`, 'info');
                } else {
                  Swal.fire('Mensaje', `${pedidoDB.mensaje}`, 'info');

                  this.store.dispatch(loadingActions.quitarLoading());
                }
              });
          });
      }
    }
  }

  abrirBitacora(pedido: string): void {
    const arrayBitacoraTem = [];
    this.pedidoService
      .obtenerBitacoraPorPedido(pedido)
      .subscribe((bitacora: any) => {
        const bitacoraSola: Array<any> = bitacora.bitacora;
        const etapaSola: Array<any> = bitacora.etapas;
        const coloresSolos: Array<any> = bitacora.colores;

        // console.log(bitacoraSola);
        // console.log(etapaSola);
        // console.log(coloresSolos);
        // console.log(bitacora);

        bitacoraSola.forEach((bita) => {
          const tipo = bita.tipo;

          switch (tipo) {
            case 'etapa':
              etapaSola.map((etapa) => {
                if (bita.etapaPed.id === etapa.id) {
                  Object.assign(bita.etapaPed, { etapa: etapa });
                }
                if (bita.etapaPedQuery.id === etapa.id) {
                  Object.assign(bita.etapaPedQuery, { etapa: etapa });
                }
              });

              break;
            case 'colores':
              coloresSolos.map((estado) => {
                if (bita.estadoPed.id === estado.id) {
                  // console.log(estado);
                  Object.assign(bita.estadoPed, { estado: estado });
                }
                if (bita.estadoPedQuery.id === estado.id) {
                  Object.assign(bita.estadoPedQuery, { estado: estado });
                }
              });

              break;

            case 'etapa-colores':
              etapaSola.map((etapa) => {
                if (bita.etapaPed.id === etapa.id) {
                  Object.assign(bita.etapaPed, { etapa: etapa });
                }
                if (bita.etapaPedQuery.id === etapa.id) {
                  Object.assign(bita.etapaPedQuery, { etapa: etapa });
                }
              });

              coloresSolos.map((estado) => {
                if (bita.estadoPed.id === estado.id) {
                  Object.assign(bita.estadoPed, { estado: estado });
                }
                if (bita.estadoPedQuery.id === estado.id) {
                  Object.assign(bita.estadoPedQuery, { estado: estado });
                }
              });

              break;
          }

          arrayBitacoraTem.push(bita);
          this.bitacoraPedido = arrayBitacoraTem;
        });
        console.log(this.bitacoraPedido);
      });
  }

  abrirAlert(objCat: any): void {
    // console.log(objCat);
    const modalEditarCliente: ObjCat = {
      abrir: true,
      idCat: objCat.idCat,
      tipo: objCat.tipo,
    };
    this.store.dispatch(
      editarClienteActions.abrirAlert({ modalEditarCliente })
    );
  }

  recibirPedido(pedido: any): void {
    this.pedido = pedido.pedidoDB;
  }

  // producto

  detectarProducto(e: Event | any): void {
    const placeHolderProducto = this.placeHolderProducto.nativeElement;

    e.target.addEventListener('blur', (ev) => {
      setTimeout(() => {
        placeHolderProducto.style.display = 'none';
      }, 200);
    });
    const valProd = e.target.value;

    if (valProd !== '') {
      this.store
        .select('login')
        .pipe(first())
        .subscribe((worker) => {
          const data = {
            token: worker.token,
            criterio: valProd,
          };

          this.productoService
            .obtenerProductoCriterioNombrePedido(data)
            .subscribe((productos: Producto) => {
              // console.log(productos);
              this.productos = productos.productosDB;

              if (
                productos.productosDB.length === 0 ||
                this.forma.controls.producto.value === ''
              ) {
                placeHolderProducto.style.display = 'none';

                this.producto = null;
                this.productos = [];
                this.forma.controls.comentario.setValue('');
                this.forma.controls.cantidad.setValue('');
                this.forma.controls.precio.setValue('');
              }

              if (productos.productosDB.length > 0) {
                placeHolderProducto.style.display = 'block';
              }
            });

          // console.log('detectarProducto');
        });
    } else {
      placeHolderProducto.style.display = 'none';
      this.producto = null;
      this.productos = [];
      this.forma.controls.comentario.setValue('');
      this.forma.controls.cantidad.setValue('');
      this.forma.controls.precio.setValue('');
    }
  }

  verPedidos(): void {
    this.store.dispatch(
      modalActions.cargarModal({ tipo: 'ver-productos', estado: true })
    );
  }

  btnAgregar(e: any, pedido: PedidoDB): void {
    const inputProducto = this.inputProducto.nativeElement;
    const idProducto = inputProducto.getAttribute('data-idProducto');

    if (idProducto === null) {
      Swal.fire('Mensaje', 'Debe agregar un pedido', 'info');
      return;
    }

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const data = {
          tipo: 'producto',
          pedido: pedido._id,
          producto: idProducto,
          token: worker.token,
          cantidad: this.forma.controls.cantidad.value,
          precio: this.forma.controls.precio.value,
          comentario: this.forma.controls.comentario.value,
          // subtotalPedido: this.objTotal.subtotal,
          // totalPedido: this.objTotal.total
          // itbms: pedido.itbms
        };

        this.productoPedidoService
          .crearProductoPedido(data)
          .pipe(first())
          .subscribe((pedidoDB: Pedido) => {
            if (pedidoDB.ok === false) {
              Swal.fire('Mensaje', `${pedidoDB.mensaje}`, 'error');
            } else if (pedidoDB.ok === true) {
              this.cargarProductosPedidos(pedidoDB.pedidoDB);

              setTimeout(() => {
                // Peticion para activar socket
                this.pedidoService.obtenerPedidos(worker.token).subscribe();
              }, 500);
            }
          });
      });
  }

  agregarProducto(producto: ProductoDB): void {
    this.forma.controls.producto.setValue(producto?.nombre);
    this.forma.controls.comentario.setValue(producto.descripcion);
    this.forma.controls.cantidad.setValue(1);
    this.forma.controls.precio.setValue(producto.precio);

    this.producto = producto;
  }

  cargarProductosPedidos(pedido: PedidoDB): void {
    const idPedido = this.route.snapshot.queryParamMap.get('id');
    if (idPedido === pedido._id) {
      this.store
        .select('login')
        .pipe(first())

        .subscribe((worker) => {
          const data = {
            token: worker.token,
            pedido: pedido._id,
          };

          this.productoPedidoService
            .obtenerProductosPedido(data)
            .pipe(first())
            .subscribe((pedidoDB: Pedido) => {
              this.productosPedidos = pedidoDB.pedidoDB.productos_pedidos;
              // console.log(pedido);
              this.costoDelPedido(pedidoDB);

              if (this.productosPedidos.length === 0) {
                this.forma.controls.itbms.disable();
              } else {
                this.forma.controls.itbms.enable();
              }
            });
        });
    }
  }

  costoDelPedido(pedido: Pedido): void {
    const idPedido = this.route.snapshot.queryParamMap.get('id');
    const productoPedido: Array<any> = pedido?.pedidoDB?.productos_pedidos;

    // console.log(idPedido, pedido.pedidoDB._id);

    if (idPedido === pedido.pedidoDB._id) {
      const itbms = pedido?.pedidoDB?.itbms;

      // if (productoPedido.length === 0) {
      //   this.objTotal.pedido = 0;
      //   this.objTotal.itbms = 0;
      //   this.objTotal.subtotal = 0;
      //   this.objTotal.pagos = 0;
      //   this.objTotal.total = 0;

      // } else {

      const mapTotalPedido = productoPedido.map((productoPed) => {
        return productoPed.total;
      });

      const totalPedido: number = mapTotalPedido.reduce((acc, current) => {
        return acc + current;
      }, 0);

      const mapPagos = pedido.pedidoDB.pagos_pedido.map((pago) => {
        if (pago.estado === false) {
          return 0;
        }
        return pago.monto;
      });

      const totalPagos: number = mapPagos.reduce((acc, current) => {
        return acc + current;
      }, 0);

      // console.log(totalPagos);

      let itbm = 0;

      if (itbms === false || !itbms) {
        const subtotal = totalPedido + itbm;
        const total = subtotal - totalPagos;

        this.objTotal.pedido = totalPedido;
        this.objTotal.itbms = itbm;
        this.objTotal.subtotal = subtotal;
        this.objTotal.pagos = totalPagos;
        this.objTotal.total = total;
      }

      if (itbms === true) {
        if (totalPedido === 0) {
          return;
        }
        // itbm = Number(totalPedido * (7 / 100));
        const mapItbms = Number(totalPedido * (7 / 100))
          .toString()
          .split('.');

        const decimales = `.${mapItbms[1].substring(0, 2)}`;
        itbm = Number(mapItbms[0].concat(decimales));

        const subtotal = totalPedido + itbm;
        const total = subtotal - totalPagos;

        this.objTotal.pedido = totalPedido;
        this.objTotal.itbms = itbm;
        this.objTotal.subtotal = subtotal;
        this.objTotal.pagos = totalPagos;
        this.objTotal.total = total;
        // }

        // console.log(Number(totalPedido * (7 / 100)));
      }

      // console.log(this.objTotal);

      // tslint:disable-next-line: max-line-length
      // this.store.dispatch(
      //   totalesAction.obtenerTotalesPedido({
      //     pedido: this.objTotal.pedido,
      //     subtotal: this.objTotal.subtotal,
      //     itbms: this.objTotal.itbms,
      //     pagos: this.objTotal.pagos,
      //     total: this.objTotal.total,
      //   })
      // );

      this.store
        .select('login')
        .pipe(first())
        // .pipe(take(3))
        .subscribe((worker) => {
          // console.log('ok'); REVISAR =====================================================
          // Actualizar pedido
          const data = {
            tipo: 'general',
            subtotal: this.objTotal.subtotal,
            total: this.objTotal.total,
            // id: this.pedido._id,
            id: idPedido,
          };

          // console.log(data.id);

          this.pedidoService
            .editarPedido(data, worker.token)
            .pipe(first())
            .subscribe(); // revisar first

          // console.log('costoDelPedido');
        });
    }
  }

  detectarItbms(e: any, pedido: PedidoDB): void {
    const itbmsChecked = e.target.checked;

    const data = {
      tipo: 'producto',
      itbms: itbmsChecked,
      id: pedido._id,
    };

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        this.pedidoService
          .editarPedido(data, worker.token)
          .subscribe((pedido1: Pedido) => {
            this.costoDelPedido(pedido1);

            setTimeout(() => {
              // Peticion para activar socket
              this.pedidoService.obtenerPedidos(worker.token).subscribe();
            }, 500);
          });
      });
  }

  eliminarProductoPedido(
    productoPedido: Productospedido,
    pedido: PedidoDB
  ): void {
    this.store.dispatch(loadingActions.cargarLoading());

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const data = {
          token: worker.token,
          IdProductoPedido: productoPedido._id,
          pedido: pedido._id,
        };

        Swal.fire({
          title: 'Mensaje',
          text: '¿Desea quitar este producto del pedido?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Quitar producto',
          cancelButtonAriaLabel: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.productoPedidoService
              .eliminarProductoPedido(data)
              .subscribe((pedidoDB: Pedido) => {
                if (pedidoDB.ok === false) {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${pedidoDB.mensaje}`, 'error');
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());
                  this.cargarProductosPedidos(pedidoDB.pedidoDB);

                  setTimeout(() => {
                    // Peticion para activar socket
                    this.pedidoService.obtenerPedidos(worker.token).subscribe();
                  }, 500);

                  Swal.fire(
                    'Mensaje',
                    'Se quitó el producto del pedido',
                    'success'
                  );
                }
              });
          } else {
            this.store.dispatch(loadingActions.quitarLoading());
          }
        });
      });
  }

  obtenerProductosSocket(): void {
    const idPedido = this.route.snapshot.queryParamMap.get('id');

    this.productosPedidoSocketService
      .escuchar('cargar-productos-pedido')
      .subscribe((pedidoDB: Pedido) => {
        if (idPedido === pedidoDB.pedidoDB._id) {
          this.productosPedidos = pedidoDB.pedidoDB.productos_pedidos;

          // console.log('cargar-productos-pedidos-socket');
        }
      });
  }

  // Archivo
  addArchivo(): void {
    this.store.dispatch(
      modalActions.cargarModal({
        tipo: 'subir-archivos',
        estado: true,
        data: this.pedido._id,
      })
    );
  }

  cargarArchivos(): void {
    const idPedido = this.route.snapshot.queryParamMap.get('id');

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        this.archivoService
          .obtenerArchivosPorPedido(worker.token, idPedido)
          .subscribe((archivo: Archivo) => {
            // console.log(archivo);
            this.archivo = archivo;
          });
      });
  }

  eliminarArchivo(idArchivo: string, idPedido: string): void {
    Swal.fire({
      title: 'Mensaje',
      text: '¿Desea eliminar este archivo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar archivo',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(loadingActions.cargarLoading());

        this.store
          .select('login')
          .pipe(first())
          .subscribe((worker) => {
            const data = {
              id: idArchivo,
              pedido: idPedido,
              token: worker.token,
            };

            this.archivoService
              .eliminarArchivos(data)
              .subscribe((archivo: Archivo) => {
                if (archivo.ok === true) {
                  // Activar socket de archivos
                  this.archivoService
                    .obtenerArchivosPorPedido(worker.token, idPedido)
                    .subscribe();
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${archivo.mensaje}`, 'info');
                } else {
                  this.store.dispatch(loadingActions.quitarLoading());

                  Swal.fire('Mensaje', `${archivo.mensaje}`, 'error');
                }
              });
          });
      }
    });
  }

  cargarArchivosSocket(): void {
    this.route.queryParams.pipe(first()).subscribe((idPedido) => {
      const id = idPedido.id;
      // console.log(id);
      this.archivoSocketService
        .escuchar('cargar-archivos')
        .subscribe((archivo: Archivo) => {
          // this.archivo = archivo;
          // console.log(archivo);

          if (id === archivo.idPedido) {
            this.archivo = archivo;
          }
        });
    });
  }

  // seguimiento
  guardarSeguimiento(
    idProductoPedido: string,
    valueSeg: any,
    valueProd: any
  ): void {
    this.store.dispatch(loadingActions.cargarLoading());

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const data = {
          token: worker.token,
          id: idProductoPedido,
          seguimiento_disenio: valueSeg.value,
          seguimiento_produccion: valueProd.value,
        };

        this.productoPedidoService
          .editarProductoPedido(data)
          .subscribe((productoPedido: ProductoPedido) => {
            if (productoPedido.ok === true) {
              Swal.fire('Mensaje', `${productoPedido.mensaje}`, 'info');

              this.store.dispatch(loadingActions.quitarLoading());
            } else {
              Swal.fire('Mensaje', `${productoPedido.mensaje}`, 'error');

              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });

    // console.log(idProductoPedido, idPedido, valueSeg.value, valueProd.value);
  }

  detectarSeguimiento(
    value: Event,
    idProductoPedido: string,
    tipo: number
  ): void {
    const val = (value.target as HTMLInputElement).value;

    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        const data = {
          token: worker.token,
          id: idProductoPedido,
          // seguimiento_disenio: valueSeg.value,
          // seguimiento_produccion: valueProd.value
        };

        if (tipo === 0) {
          Object.assign(data, { seguimiento_disenio: val });
        } else if (tipo === 1) {
          Object.assign(data, { seguimiento_produccion: val });
        }

        this.productoPedidoService
          .editarProductoPedido(data)
          .subscribe((productoPedido: ProductoPedido) => {
            if (productoPedido.ok === false) {
              Swal.fire('Mensaje', `${productoPedido.mensaje}`, 'error');

              this.store.dispatch(loadingActions.quitarLoading());
            }
          });
      });
  }

  // pagos
  addPago(): void {
    this.store.dispatch(
      modalActions.cargarModal({
        tipo: 'crear-pago',
        estado: true,
        data: { pedido: this.pedido._id, monto: this.objTotal.total },
      })
    );
  }

  obtenerPagosPorPedido(idPedido: string): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id === idPedido) {
      // return;
      this.store
        .select('login')
        .pipe(first())
        .subscribe((worker) => {
          this.pagoService
            .obtenerPagosPorPedido(worker.token, idPedido)
            .pipe(first())
            .subscribe((pedido: Pedido) => {
              this.pagos = pedido.pedidoDB.pagos_pedido;
              // console.log('obtenerPagosPorPedido');
            });
        });
    }
  }

  obtenerPagosSocket(): void {
    this.route.queryParams.subscribe((idPedido) => {
      const id = idPedido.id;
      this.pagoSocketService
        .escuchar('recibir-pagos')
        .subscribe((pedido: Pedido) => {
          // this.archivo = archivo;

          if (id === pedido.pedidoDB._id) {
            // console.log(pedido);
            this.costoDelPedido(pedido);
            this.pagos = pedido.pedidoDB.pagos_pedido;
          }
        });
    });

    // this.pagoSocketService
    //   .escuchar('recibir-pagos')
    //   // .pipe(take(3))
    //   .subscribe((pedido: Pedido) => {
    //     // console.log(pedido);
    //     this.costoDelPedido(pedido);
    //     this.pagos = pedido.pedidoDB.pagos_pedido;
    //   });
  }

  checkEstadoPago(e: Event, pago: string): void {
    const evento = (e.target as HTMLInputElement).checked;

    if (!evento) {
      this.store.dispatch(
        modalActions.cargarModal({
          tipo: 'estado-pago',
          estado: true,
          data: { evento, pedido: this.pedido._id, pago },
        })
      );
    }
  }

  motivoPagoAlert(pago: any): void {
    Swal.fire('Motivo', `${pago.motivo}`, 'info');
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.pagoSocketService.quitarSubscripcion('recibir-pagos');
    this.productosPedidoSocketService.quitarSubscripcion(
      'cargar-productos-pedido'
    );
  }
}
