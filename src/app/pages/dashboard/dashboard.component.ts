import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/globarReducers';

import anime from 'animejs/lib/anime.es.js';
import { timer } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('wrapSidebar', { static: true })
  wrapSidebar: ElementRef<HTMLElement>;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.abrirCerrarMenu();
    this.botonCerrarSidebar();
  }

  @HostListener('window:resize', ['$event']) detectarAnchoPag(event) {
    this.botonCerrarSidebar();
  }

  botonCerrarSidebar(): void {
    const timerSidebar = timer(0, 2000)
      // .pipe(first())
      .subscribe((resp) => {
        const anchoWindow = window.innerWidth;
        const sidebar = this.wrapSidebar.nativeElement;
        const close = sidebar.querySelector('#close') as HTMLElement;

        if (sidebar) {
          if (anchoWindow <= 576) {
            sidebar.style.position = 'absolute';
            sidebar.style.zIndex = '999';
            close.style.display = 'block';
          } else {
            sidebar.style.position = 'relative';
            sidebar.style.zIndex = '0';
            close.style.display = 'none';
          }

          timerSidebar.unsubscribe();
        }
      });
  }

  abrirCerrarMenu(): void {
    this.store.select('sidebar').subscribe((resp: boolean) => {
      if (this.wrapSidebar) {
        if (!resp) {
          anime({
            targets: this.wrapSidebar.nativeElement,
            marginLeft: -this.wrapSidebar.nativeElement.clientWidth,
            easing: 'linear',
            duration: 100,
          });
        } else {
          anime({
            targets: this.wrapSidebar.nativeElement,
            marginLeft: 0,
            easing: 'linear',
            duration: 100,
          });
        }
      }
    });
  }
}
