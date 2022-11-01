import {
  SimpleChanges,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { AppState } from '../../reducers/globarReducers';
import anime from 'animejs/lib/anime.es.js';
import { UsuarioWorker } from '../../interfaces/resp-worker';
import { Subscription, timer } from 'rxjs';
import * as menuActions from '../../reducers/abrir-cerrar-sidebar/abrir-cerrar-sidebar-actions';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @ViewChild('catalogo', { static: true }) catalogo: ElementRef<HTMLElement>;
  @ViewChild('wrapSidebar', { static: true })
  wrapSidebar: ElementRef<HTMLElement>;
  usuario: UsuarioWorker;
  sub1: Subscription;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.cargarUsuario();
    this.animacionRow();
    this.despliegueInicialSidebar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cargarUsuario();
  }

  @HostListener('window:resize', ['$event']) detectarAnchoPag(event) {
    this.store
      .select('sidebar')
      .pipe(first())
      .subscribe((resp: boolean) => {
        const anchoWindow = window.innerWidth;

        if (anchoWindow < 768) {
          if (resp) {
            this.store.dispatch(menuActions.abrirCerrarSidebar());
          }
        } else {
          if (!resp) {
            this.store.dispatch(menuActions.abrirCerrarSidebar());
          }
        }
      });
  }

  cerrarSidebar(): void {
    this.store.dispatch(menuActions.abrirCerrarSidebar());
  }

  despliegueInicialSidebar(): void {
    const timerSide = timer(0, 500).subscribe((time) => {
      const anchoWindow = window.innerWidth;
      const sidebar = document.getElementById('sidebar');

      if (anchoWindow < 768) {
        if (sidebar) {
          this.store.dispatch(menuActions.abrirCerrarSidebar());
          timerSide.unsubscribe();
        }
      }
    });
  }

  cargarUsuario(): void {
    this.store
      .select('login')
      // .pipe(take(2))
      .subscribe((usuario) => {
        this.usuario = usuario.usuarioDB;
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

        // pedidos.addEventListener('click', (e) => {
        //   const isShow = pedidos.getAttribute('aria-expanded');
        //   const rowPedidos = document.getElementById('row-pedidos');

        //   if (isShow === 'true') {
        //     anime({
        //       targets: rowPedidos,
        //       rotateZ: 90,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   } else {
        //     anime({
        //       targets: rowPedidos,
        //       rotateZ: 0,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   }
        // });

        // reporte.addEventListener('click', (e) => {
        //   const isShow = reporte.getAttribute('aria-expanded');
        //   const rowReportes = document.getElementById('row-reportes');

        //   if (isShow === 'true') {
        //     anime({
        //       targets: rowReportes,
        //       rotateZ: 90,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   } else {
        //     anime({
        //       targets: rowReportes,
        //       rotateZ: 0,
        //       easing: 'linear',
        //       duration: 200,
        //     });
        //   }
        // });
      }
    }, 800);
  }

  salir(): void {
    localStorage.clear();
    window.location.reload();
  }
}
