import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Pedido, PedidoDB } from '../../../../interfaces/pedido';
import { ProductoPedido } from '../../../../interfaces/producto-pedido';
import { AppState } from '../../../../reducers/globarReducers';
import { ProductoPedidoService } from '../../../../services/producto-pedido.service';
import { ActivatedRoute } from '@angular/router';
import { PedidoService } from '../../../../services/pedido.service';
import { ProductoPedidoSocket } from '../../../../services/sockets/productos-pedido.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss'],
})
export class SeguimientoComponent implements OnInit {
  @Input() pedido: PedidoDB;
  layout = 'horizontal';

  constructor(
    private store: Store<AppState>,
    private produPedSer: ProductoPedidoService,
    private prodPedSocketService: ProductoPedidoSocket,
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private breakPointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.cargarPedido();
    this.mediaQuery();
    this.prodPedSocket();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cargarPedido();
  }

  cargarPedido(): void {
    const time = timer(0, 1000).subscribe((resp) => {
      // console.log(this.pedido);

      if (this.pedido) {
        time.unsubscribe();
      }

      if (resp > 10) {
        time.unsubscribe();
      }
    });
  }

  detectUserKeyUp(e: any, pPedido: any, idProdsPeds: string): void {
    const value = e.target.value;
    const label = document.getElementById(`${idProdsPeds}`) as HTMLElement;
    label.innerText = 'Esperando para guardar...';

    // console.log(idProdPed);
  }

  guardar(idProdsPeds: string, idProdPed: string): void {
    this.store
      .select('login')
      // .pipe(first())
      .subscribe((usuario) => {
        if (usuario.usuarioDB) {
          const valueDise: any = document.getElementById(`${idProdsPeds}-dise`);
          const valueProd: any = document.getElementById(`${idProdsPeds}-prod`);
          const label = document.getElementById(
            `${idProdsPeds}`
          ) as HTMLElement;
          label.innerText = 'Guardando...';

          const data = {
            idProdPed,
            token: usuario.token,
            seg_disenio: valueDise.value,
            seg_prod: valueProd.value,
            foranea: '',
          };

          if (usuario.usuarioDB.empresa) {
            data.foranea = usuario.usuarioDB._id;
          } else {
            data.foranea = usuario.usuarioDB.foranea;
          }

          this.produPedSer
            .editarSeguimientos(data)
            .subscribe((productoPedido: ProductoPedido) => {
              if (productoPedido.ok) {
                label.innerText = 'Seguimiento guardado 👌';
                setTimeout(() => {
                  label.innerText = '';
                }, 2000);
              } else {
                label.innerText = 'No se pudo guardar 😥';
              }
            });
        }
      });
  }

  mediaQuery(): void {
    this.breakPointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((state: BreakpointState) => {
        const time = timer(0, 300).subscribe((resp) => {
          const spliter = document.querySelector('.p-splitter') as HTMLElement;

          if (spliter) {
            if (state.matches) {
              // console.log(spliter);
              spliter.style.flexDirection = 'column';
              this.layout = 'vertical';
            } else {
              spliter.style.flexDirection = 'row';
              this.layout = 'horizontal';
            }
            time.unsubscribe();
          }
        });
      });
  }

  obtenerProductosPedidos(): void {
    this.store.select('login').subscribe((usuario) => {
      if (usuario.usuarioDB) {
        const data = {
          token: usuario.token,
          id: this.pedido._id,
          foranea: '',
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
  }

  prodPedSocket(): void {
    this.prodPedSocketService
      .escuchar('cargar-seguimiento')
      .subscribe((resp) => {
        this.obtenerProductosPedidos();
      });
  }
}
