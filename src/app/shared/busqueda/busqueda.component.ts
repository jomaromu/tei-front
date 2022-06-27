import * as busquedaActions from './../../reducers/busqueda/busqueda.actions';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AyudaDB } from '../../interfaces/ayuda';
import { Pedido } from '../../interfaces/pedido';
import { AppState } from '../../reducers/globarReducers';
import * as loginActions from '../../reducers/login/login.actions';
import { PedidoService } from '../../services/pedido.service';
import { PedidoDB } from '../../interfaces/pedido';
import { Subscription } from 'rxjs';
import { ObjBusqueda } from '../../reducers/busqueda/busqueda.reducer';
import { MiBandeja } from '../../reducers/historial-bandejas/historial-bandejas.reducer';
import * as historialBandejaActions from '../../reducers/historial-bandejas/historial-bandejas.actions';
import * as porEntregarActions from '../../reducers/por-entregar/por-entregar.actions';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.scss'],
})
export class BusquedaComponent implements OnInit, OnDestroy {
  @ViewChild('fondo', { static: true }) fondo: ElementRef<HTMLElement>;
  @ViewChild('ayuda', { static: true }) ayuda: ElementRef<HTMLElement>;
  @ViewChild('txtBusqueda', { static: true })
  txtBusqueda: ElementRef<HTMLInputElement>;
  @Input() pedidos: Pedido;
  @Output() emitirPedidos = new EventEmitter<Array<PedidoDB>>();

  ayudas: Array<AyudaDB>;

  sub1: Subscription;
  sub2: Subscription;

  constructor(
    private store: Store<AppState>,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    this.cargarAyudas();
    this.limpiarBusqueda();
    this.cargarBusqueda();
  }

  mostrarAyudas(): void {
    const fondo = this.fondo.nativeElement;
    const ayuda = this.ayuda.nativeElement;

    fondo.style.display = 'flex';

    ayuda.classList.remove('animate__flipOutX');
    ayuda.classList.add('animate__flipInX');
  }

  cerrarFondo(): void {
    const fondo = this.fondo.nativeElement;
    const ayuda = this.ayuda.nativeElement;

    ayuda.classList.remove('animate__flipInX');
    ayuda.classList.add('animate__flipOutX');

    setTimeout(() => {
      fondo.style.display = 'none';
    }, 800);
  }

  cargarAyudas(): void {
    const token = localStorage.getItem('token');
    this.sub1 = this.store
      .select('login')
      .pipe(first())
      .subscribe((worker) => {
        this.store.dispatch(loginActions.obtenerToken({ token: worker.token }));
      });

    this.store.select('ayuda').subscribe((ayudas: Array<AyudaDB>) => {
      if (!ayudas) {
        return;
      } else {
        const filtroAyudas = ayudas.filter((ayuda) => ayuda.estado !== false);

        this.ayudas = filtroAyudas;
      }
    });
  }

  buscarPedidos(e: Event): void {
    // const criterio = (e.target as HTMLInputElement).value.trim();
    const criterio = (e.target as HTMLInputElement).value;

    // console.log('CRITERIO', criterio);

    if (criterio === '') {
      const ObjBusqueda: ObjBusqueda = {
        criterio,
        estado: false,
      };
      this.store.dispatch(
        busquedaActions.crearBusqueda({ objBusqueda: ObjBusqueda })
      );
    }

    if (criterio !== '') {
      const ObjBusqueda: ObjBusqueda = {
        criterio,
        estado: true,
      };
      this.store.dispatch(
        busquedaActions.crearBusqueda({ objBusqueda: ObjBusqueda })
      );
    }

    this.store.pipe(first()).subscribe((dataReducer) => {
      const miBandeja: MiBandeja = {
        bandeja: 'null',
        sucursal: 'null',
        usuario: 'null',
        temUserVend: 'null',
        temUserDise: 'null',
        cargaInicial: false,
        usoBandeja: false,
      };

      this.store.dispatch(
        historialBandejaActions.crearHistorial({ miBandeja: miBandeja })
      );

      this.store.dispatch(porEntregarActions.crearEstado({ estado: false }));
    });
  }

  limpiarBusqueda(): void {
    this.store.select('busqueda').subscribe((data) => {
      const txtBusqueda = this.txtBusqueda.nativeElement;

      if (data.estado === false) {
        // console.log(data.estado);
        txtBusqueda.value = '';
      }
    });
  }

  cargarBusqueda(): void {
    this.store.select('busqueda').subscribe((busqueda) => {
      const txtBusqueda: any = document.getElementById('txtBusqueda');
      txtBusqueda.value = `${busqueda.criterio}`;
    });
  }

  ngOnDestroy(): void {
    // this.sub1.unsubscribe();
  }
}
