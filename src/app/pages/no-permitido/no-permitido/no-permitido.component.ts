import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-permitido',
  templateUrl: './no-permitido.component.html',
  styleUrls: ['./no-permitido.component.scss'],
})
export class NoPermitidoComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  login(): void {
    localStorage.clear()
    window.location.reload();
  }
}
