import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { first, mergeMap, take } from 'rxjs/operators';
import { Usuario } from '../../interfaces/resp-worker';
import { AppState } from '../../reducers/globarReducers';
import { UserService } from './../../services/user.service';
import { SucursalService } from './../../services/sucursal.service';
import { Sucursal } from './../../interfaces/sucursales';
import { PedidoService } from './../../services/pedido.service';
import { Pedido, PedidoDB } from './../../interfaces/pedido';
import * as historialBandejaActions from '../../reducers/historial-bandejas/historial-bandejas.actions';
import * as busquedaActions from '../../reducers/busqueda/busqueda.actions';
import { MiBandeja } from '../../reducers/historial-bandejas/historial-bandejas.reducer';
import { Subscription } from 'rxjs';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';
import * as porEntregarActions from '../../reducers/por-entregar/por-entregar.actions';

@Component({
  selector: 'app-mi-bandeja',
  templateUrl: './mi-bandeja.component.html',
  styleUrls: ['./mi-bandeja.component.scss'],
})
export class MiBandejaComponent implements OnInit, OnDestroy {
  rolePermitido = false;
  optBandeja = [];
  usuarios: any;
  sucursales: Sucursal;
  userFake = { id: 'null', nombre: 'Todas' };
  pedidos: Pedido;
  miBandeja: MiBandeja;
  tempUsuarioVend: string;
  tempUsuarioDise: string;

  RoleUsuario: string;

  forma: FormGroup;

  sub1: Subscription;
  sub2: Subscription;
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private userService: UserService,
    private sucursalService: SucursalService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    // this.busqueda();
    this.formularioInicial();
    this.cargarSucursales();
    // this.resetBusquedas();
  }

  formularioInicial(): void {
    this.sub1 = this.store.subscribe((dataReducer) => {
      const bandeja = dataReducer.historialBandeja.bandeja;
      const sucursal = dataReducer.historialBandeja.sucursal;
      const usuario = dataReducer.historialBandeja.usuario;

      // se quita ya que hay que evalutarlo individual en bandeja
      this.forma = this.fb.group({
        selBandeja: ['null'],
        usuarios: ['null'],
        sucursal: ['null'],
      });
      this.usuarios = [];

      const mantenerHistorialBandeja = (tipoBandeja?: string) => {
        // console.log(tipoBandeja);
        switch (tipoBandeja) {
          case 'vend':
            this.forma = this.fb.group({
              selBandeja: [bandeja],
              usuarios: [dataReducer.historialBandeja.temUserVend],
              sucursal: [sucursal],
            });
            break;
          case 'dise':
            this.forma = this.fb.group({
              selBandeja: [bandeja],
              usuarios: [dataReducer.historialBandeja.temUserDise],
              sucursal: [sucursal],
            });
            break;
        }
        this.detectarUsuarios();
      };

      switch (bandeja) {
        case 'prod':
          this.forma = this.fb.group({
            selBandeja: [bandeja],
            usuarios: ['null'],
            sucursal: [sucursal],
          });
          break;
        case 'vend':
          mantenerHistorialBandeja('vend');
          break;
        case 'dise':
          mantenerHistorialBandeja('dise');
          break;
        case 'miband':
          this.forma = this.fb.group({
            selBandeja: [bandeja],
            usuarios: ['null'],
            sucursal: [sucursal],
          });
          break;
        case 'null':
          this.forma = this.fb.group({
            selBandeja: ['null'],
            usuarios: ['null'],
            sucursal: [sucursal],
          });
          break;
      }

      const worker = dataReducer.login;
      // const historial = dataReducer.historialBandeja;

      const role: string = worker?.usuario?.colaborador_role;
      const idUsuario: string = worker?.usuario?._id;

      switch (role) {
        case 'SuperRole':
          this.optBandeja = [
            { nombre: 'Todas', id: 'null' },
            { nombre: 'Producción', id: 'prod' },
            { nombre: 'Vendedor', id: 'vend' },
            { nombre: 'Diseñador', id: 'dise' },
          ];
          this.rolePermitido = true;
          this.crearActualizarHistorialDB(idUsuario);
          break;
        case 'AdminRole':
          this.optBandeja = [
            { nombre: 'Todas', id: 'null' },
            { nombre: 'Producción', id: 'prod' },
            { nombre: 'Vendedor', id: 'vend' },
            { nombre: 'Diseñador', id: 'dise' },
          ];
          this.rolePermitido = true;
          this.crearActualizarHistorialDB(idUsuario);
          break;
        case 'ProduccionVIPRole':
          this.optBandeja = [{ nombre: 'Producción', id: 'prod' }];
          this.forma.controls.selBandeja.setValue(this.optBandeja[0].id);
          this.crearActualizarHistorialDB(idUsuario);
          this.rolePermitido = true;

          break;
        case 'VendedorVIPRole':
          this.optBandeja = [
            { nombre: 'Todas', id: 'null' },
            { nombre: 'Mi bandeja', id: 'miband' },
            { nombre: 'Vendedor', id: 'vend' },
          ];
          this.forma.controls.selBandeja.setValue(this.optBandeja[1].id);
          this.crearActualizarHistorialDB(idUsuario);
          this.rolePermitido = true;

          break;
        case 'DiseniadorVIPRole':
          this.optBandeja = [
            { nombre: 'Todas', id: 'null' },
            { nombre: 'Mi bandeja', id: 'miband' },
            { nombre: 'Diseñador', id: 'dise' },
          ];
          this.forma.controls.selBandeja.setValue(this.optBandeja[1].id);
          this.crearActualizarHistorialDB(idUsuario);
          this.rolePermitido = true;

          break;
      }
      // console.log(this.forma.controls.selBandeja.value);

      // Historial DB
    });

    // Crear historial DB segun role
  }

  crearActualizarHistorialDB(idUsuario: string): void {
    const data = {
      idUsuario,
      bandeja: this.forma.controls.selBandeja.value,
      sucursal: this.forma.controls.sucursal.value,
      usuario: this.forma.controls.usuarios.value,
    };

    // console.log(data);
    // return;
    this.userService.historialDB(data).subscribe();
  }

  detectarUsuarios(): void {
    this.store
      // .select('login')
      .pipe(first())
      .subscribe((dataReducer) => {
        let valBandeja = this.forma.controls.selBandeja.value;
        const worker = dataReducer.login;

        this.userService
          .obtenerUsuarios(worker.token)
          .pipe(first())
          .subscribe((resp: Usuario) => {
            if (resp.usuarios.length === 0) {
              this.forma.controls.usuarios.setValue('null');
            } else {
              switch (valBandeja) {
                case 'dise':
                  this.usuarios = resp.usuarios.filter((usuario) => {
                    if (
                      usuario.colaborador_role === 'DiseniadorRole' ||
                      usuario.colaborador_role === 'DiseniadorVIPRole'
                    ) {
                      return usuario;
                    }
                  });

                  this.forma.controls.usuarios.setValue(
                    dataReducer.historialBandeja.temUserDise
                  );

                  // si usuario es null del historial, setear el usuario 0 de base de datos
                  // this.forma.controls.usuarios.setValue(this.usuarios[0]._id);

                  break;
                case 'vend':
                  this.usuarios = resp.usuarios.filter((usuario) => {
                    if (
                      usuario.colaborador_role === 'VendedorNormalRole' ||
                      usuario.colaborador_role === 'VendedorVIPRole'
                    ) {
                      return usuario;
                    }
                  });

                  this.forma.controls.usuarios.setValue(
                    dataReducer.historialBandeja.temUserVend
                  );
                  break;
                case 'prod':
                  this.forma.controls.usuarios.setValue('null');
                  this.usuarios = [];
                  break;
                case 'miband':
                  this.forma.controls.usuarios.setValue('null');
                  this.usuarios = [];
                  break;
              }
            }
          });
      });
  }

  cargarSucursales(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        this.sucursalService
          .obtenerSucursales(worker.token)
          .pipe(first())
          .subscribe((sucursales: Sucursal) => {
            this.sucursales = sucursales;
            const sucursalFake: any = {
              _id: 'null',
              nombre: 'Todas',
            };
            this.sucursales.sucursalesDB.unshift(sucursalFake);
            this.forma.controls.sucursal.setValue(
              sucursales.sucursalesDB[0]._id
            );
          });
      });
  }

  limpiarForma(): void {
    this.store.select('login').subscribe((worker) => {
      if (
        worker.usuario.colaborador_role === 'AdminRole' ||
        worker.usuario.colaborador_role === 'SuperRole'
      ) {
        this.forma.controls.selBandeja.setValue('null');
      } else if (worker.usuario.colaborador_role === 'ProduccionVIPRole') {
        this.forma.controls.selBandeja.setValue(this.optBandeja[0].id);
      } else if (
        worker.usuario.colaborador_role === 'VendedorVIPRole' ||
        worker.usuario.colaborador_role === 'DiseniadorVIPRole'
      ) {
        this.forma.controls.selBandeja.setValue(this.optBandeja[1].id);
      }
      this.forma.controls.sucursal.setValue('null');
      this.forma.controls.usuarios.setValue('null');
      this.usuarios = [];
    });
  }

  aplicarFiltro(): void {
    const valBandeja = this.forma.controls.selBandeja.value;
    const valUser = this.forma.controls.usuarios.value;
    const valSucursal = this.forma.controls.sucursal.value;

    this.sub2 = this.store.subscribe((dataReducer) => {
      const colaborador = dataReducer.login;

      if (valBandeja === 'vend') {
        this.tempUsuarioVend = valUser;
        this.tempUsuarioDise = 'null';
      } else if (valBandeja === 'dise') {
        this.tempUsuarioDise = valUser;
        this.tempUsuarioVend = 'null';
      } else if (valBandeja === 'prod' || valBandeja === 'miband') {
        this.tempUsuarioDise = 'null';
        this.tempUsuarioVend = 'null';
      }
      const data = {
        token: colaborador.token,
        bandejas: valBandeja,
        userID: valUser,
        sucursal: valSucursal,
      };

      this.forma.controls.selBandeja.setValue(
        dataReducer.historialBandeja.bandeja
      );

      this.crearActualizarHistorialDB(colaborador?.usuario?._id);
    });

    this.miBandeja = {
      bandeja: valBandeja,
      sucursal: valSucursal,
      usuario: valUser,
      temUserVend: this.tempUsuarioVend,
      temUserDise: this.tempUsuarioDise,
      cargaInicial: false,
      usoBandeja: true,
    };

    // console.log(this.miBandeja);
    this.store.dispatch(
      historialBandejaActions.crearHistorial({ miBandeja: this.miBandeja })
    );

    const ObJBusqueda: ObjBusqueda = {
      criterio: '',
      estado: false,
    };
    this.store.dispatch(
      busquedaActions.crearBusqueda({ objBusqueda: ObJBusqueda })
    );

    this.store.dispatch(porEntregarActions.crearEstado({ estado: false }));
  }

  recibirPedidos(pedidos: Array<PedidoDB>): void {
    this.pedidos.pedidosDB = pedidos;
  }

  resetBusquedas(): void {
    this.store.pipe(first()).subscribe((dataReducer) => {
      // this.miBandeja = {
      //   bandeja: 'null',
      //   sucursal: 'null',
      //   usuario: 'null',
      //   temUserVend: 'null',
      //   temUserDise: 'null',
      //   cargaInicial: false,
      // };

      // // console.log(this.miBandeja);
      // this.store.dispatch(
      //   historialBandejaActions.crearHistorial({ miBandeja: this.miBandeja })
      // );

      const ObJBusqueda: ObjBusqueda = {
        criterio: '',
        estado: false,
      };
      this.store.dispatch(
        busquedaActions.crearBusqueda({ objBusqueda: ObJBusqueda })
      );

      // this.store.dispatch(porEntregarActions.crearEstado({ estado: false }));
    });
  }

  // busqueda(): void {
  //   this.store.dispatch(busquedaActions.crearBusqueda({ criterio: '' }));
  // }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    // this.sub2.unsubscribe();
  }
}
