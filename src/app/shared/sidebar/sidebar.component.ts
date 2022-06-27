import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first, take } from 'rxjs/operators';
import { AppState } from '../../reducers/globarReducers';
import * as loginActions from '../../reducers/login/login.actions';
import anime from 'animejs/lib/anime.es.js';
import { Router, ActivatedRoute } from '@angular/router';
import { Usuario } from '../../interfaces/resp-worker';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('catalogo', { static: true }) catalogo: ElementRef<HTMLElement>;
  usuario: Usuario;
  role: string;
  rolePermitido = true;
  roles = [
    {
      id: 'SuperRole',
      nombre: 'Super Usuario',
    },
    {
      id: 'AdminRole',
      nombre: 'Administrador',
    },
    {
      id: 'ProduccionNormalRole',
      nombre: 'Producción',
    },
    {
      id: 'ProduccionVIPRole',
      nombre: 'Producción VIP',
    },
    {
      id: 'VendedorNormalRole',
      nombre: 'Vendedor',
    },
    {
      id: 'VendedorVIPRole',
      nombre: 'Vendedor VIP',
    },
    {
      id: 'DiseniadorRole',
      nombre: 'Diseñador',
    },
    {
      id: 'DiseniadorVIPRole',
      nombre: 'Diseñador VIP',
    },
  ];

  sub1: Subscription;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarWorker();
    this.animacionRow();
  }

  ngAfterViewChecked(): void {
    this.sub1 = this.store
      .select('login')
      // .pipe(take(2))
      .subscribe((worker) => {
        this.usuario = worker;
        this.role = worker?.usuario?.colaborador_role;

        if (
          this.role === 'DiseniadorRole' ||
          this.role === 'DiseniadorVIPRole'
        ) {
          this.rolePermitido = false;
        }
      });
  }

  animacionRow(): void {
    // if (this.role === 'AdminRole' || this.role === 'SuperRole') {

    setTimeout(() => {
      if (document.getElementById('catalogo') !== null) {
        const catalogo = document.getElementById('catalogo');
        const pedidos = document.getElementById('pedidos');
        const reporte = document.getElementById('reporte');

        catalogo.addEventListener('click', (e) => {
          const isShow = catalogo.getAttribute('aria-expanded');
          const rowCatalogo = document.getElementById('row-catalogo');

          if (isShow === 'true') {
            anime({
              targets: rowCatalogo,
              rotateZ: 90,
              easing: 'linear',
              duration: 200,
            });
          } else {
            anime({
              targets: rowCatalogo,
              rotateZ: 0,
              easing: 'linear',
              duration: 200,
            });
          }
        });

        pedidos.addEventListener('click', (e) => {
          const isShow = pedidos.getAttribute('aria-expanded');
          const rowPedidos = document.getElementById('row-pedidos');

          if (isShow === 'true') {
            anime({
              targets: rowPedidos,
              rotateZ: 90,
              easing: 'linear',
              duration: 200,
            });
          } else {
            anime({
              targets: rowPedidos,
              rotateZ: 0,
              easing: 'linear',
              duration: 200,
            });
          }
        });

        reporte.addEventListener('click', (e) => {
          const isShow = reporte.getAttribute('aria-expanded');
          const rowReportes = document.getElementById('row-reportes');

          if (isShow === 'true') {
            anime({
              targets: rowReportes,
              rotateZ: 90,
              easing: 'linear',
              duration: 200,
            });
          } else {
            anime({
              targets: rowReportes,
              rotateZ: 0,
              easing: 'linear',
              duration: 200,
            });
          }
        });
      }
    }, 800);
  }

  cargarWorker(): void {
    this.store
      .select('login')
      .pipe(first())
      .subscribe((usuario) => {
        this.store.dispatch(
          loginActions.obtenerToken({ token: usuario.token })
        );
      });
  }

  // irACatalogo(pathPrincipal: string, categoria: string): void {
  //   this.router.navigate([`${pathPrincipal}`], {
  //     queryParams: { cat: categoria },
  //   });
  // }

  salir(): void {
    localStorage.clear();
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
  }
}
