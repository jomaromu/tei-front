import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/reducers/globarReducers';
import { Usuario } from '../../interfaces/resp-worker';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  worker: Usuario;

  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {

  }

}
