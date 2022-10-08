import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Pedido, PedidoDB } from '../../../interfaces/pedido';
import { AppState } from '../../../reducers/globarReducers';
import { PedidoService } from '../../../services/pedido.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
})
export class PedidoComponent implements OnInit, OnDestroy {
  pedido: PedidoDB;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.legendStyle();
    this.cargarPedido();
    this.detectarTabs();
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  cargarPedido(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params.id;

      this.store
        .select('login')
        .pipe(first())
        .subscribe((usuario) => {
          const data = {
            token: usuario.token,
            id,
          };

          this.pedidoService.obtenerPedido(data).subscribe((pedido: Pedido) => {
            this.pedido = pedido.pedidoDB;
          });
        });
    });
  }

  detectarTabs(): void {
    const time = timer(0, 500).subscribe((resp) => {
      const tabs = document.getElementsByClassName('p-tabview-nav');

      if (tabs) {
        const tab = tabs[0] as HTMLElement;

        tab.style.display = 'grid';
        tab.style.gridTemplateColumns = 'repeat(5, 1fr)';

        time.unsubscribe();
      }
    });
  }

  legendStyle(): void {
    const time = timer(0, 300).subscribe((resp) => {
      const legends = document.querySelectorAll(
        'legend'
      ) as NodeListOf<HTMLElement>;

      const arrayLegend = Array.from(legends);

      arrayLegend.forEach((legend, index) => {
        if (legend) {
          legend.style.width = '30%';
          legend.style.float = 'none';
          legend.style.marginLeft = '20px';
          legend.style.wordBreak = 'break-all';
          legend.style.fontSize = '1.1rem';
          legend.style.textAlign = 'left';

          const legendSpand = document.querySelectorAll('legend > span')[
            index
          ] as HTMLElement;
          legendSpand.style.justifyContent = 'flex-start';
          time.unsubscribe();
        }
      });
    });
  }

  ngOnDestroy(): void {}
}
