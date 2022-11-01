import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/reducers/globarReducers';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  @ViewChild('body', { static: true }) body: ElementRef<HTMLElement>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.manejoLoading();
  }

  manejoLoading(): void {
    this.store.select('loading').subscribe((resp) => {
      const body = this.body.nativeElement;
      if (resp) {
        body.style.display = 'flex';
      } else {
        body.style.display = 'none';
      }
    });
  }
}
