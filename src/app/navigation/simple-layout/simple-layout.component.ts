import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SidenavControllerService, SIDENAV_STATE, Sidenav } from 'src/app/services/sidenav-controller.service';
import { map } from 'rxjs/operators';

const helpers = {
  sidenavIsOpen: (state: SIDENAV_STATE) => state === SIDENAV_STATE.OPEN
};

@Component({
  selector: 'app-simple-layout',
  templateUrl: './simple-layout.component.html',
  styleUrls: ['./simple-layout.component.css']
})
export class SimpleLayoutComponent implements OnInit {

  static readonly sidenavId = 'main';

  sidenav: Sidenav;
  sidenavIsOpen$: Observable<boolean>;

  constructor(
    private sidenavCtrl: SidenavControllerService
  ) { }

  ngOnInit() {
    this.sidenav = this.sidenavCtrl.createSidenav(SimpleLayoutComponent.sidenavId);
    this.sidenavIsOpen$ = this.sidenav.state$.pipe(map(helpers.sidenavIsOpen));
  }

  toggleSidenav() {
    this.sidenav.isOpen() ? this.sidenav.close() : this.sidenav.open();
  }

}
