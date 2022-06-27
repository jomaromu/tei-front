import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, timer } from 'rxjs';
import { AppState } from 'src/app/reducers/globarReducers';
import { first, map } from 'rxjs/operators';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit, OnDestroy {
  @ViewChild('wrapLoading', { static: true })
  wrapLoading: ElementRef<HTMLElement>;

  sub1: Subscription;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.loading();
  }

  loading(): void {
    this.store.select('loading').subscribe((data) => {
      // console.log(data);
      // const data = dataReducer.loading;

      if (data === true) {
        this.wrapLoading.nativeElement.style.display = 'flex';
      } else {
        this.wrapLoading.nativeElement.style.display = 'none';
      }
    });
  }

  ngOnDestroy(): void {
    // this.sub1.unsubscribe();
  }
}
