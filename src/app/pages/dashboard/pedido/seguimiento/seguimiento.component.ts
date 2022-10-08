import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { PedidoDB } from 'src/app/interfaces/pedido';
import { ProductoPedido } from 'src/app/interfaces/producto-pedido';
import { AppState } from 'src/app/reducers/globarReducers';
import { ProductoPedidoService } from 'src/app/services/producto-pedido.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss'],
})
export class SeguimientoComponent implements OnInit {
  @Input() pedido: PedidoDB;

  constructor(
    private store: Store<AppState>,
    private produPedSer: ProductoPedidoService
  ) {}

  ngOnInit(): void {
    this.cargarPedido();
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
      .pipe(first())
      .subscribe((usuario) => {
        const valueDise: any = document.getElementById(`${idProdsPeds}-dise`);
        const valueProd: any = document.getElementById(`${idProdsPeds}-prod`);
        const label = document.getElementById(`${idProdsPeds}`) as HTMLElement;
        label.innerText = 'Guardando...';

        const data = {
          idProdPed,
          token: usuario.token,
          seg_disenio: valueDise.value,
          seg_prod: valueProd.value,
        };

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
      });
  }
}
