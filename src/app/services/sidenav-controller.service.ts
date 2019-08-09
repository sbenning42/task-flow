import { Injectable } from '@angular/core';
import * as uuid from 'uuid/v4';
import { BehaviorSubject } from 'rxjs';

export enum SIDENAV_STATE {
  OPEN = '[SIDENAV STATE] OPEN',
  CLOSE = '[SIDENAV STATE] CLOSE',
}

export class Sidenav {

  private state: BehaviorSubject<SIDENAV_STATE>;
  get state$() {
    return this.state.asObservable();
  }
  
  constructor(
    public id: string = uuid(),
    initialState: SIDENAV_STATE = SIDENAV_STATE.CLOSE
  ) {
    this.state = new BehaviorSubject(initialState);
  }

  isOpen() {
    return this.state.value === SIDENAV_STATE.OPEN;
  }

  isClose() {
    return this.state.value === SIDENAV_STATE.CLOSE;
  }

  open() {
    if (this.state.value !== SIDENAV_STATE.OPEN) {
      this.state.next(SIDENAV_STATE.OPEN);
    }
  }

  close() {
    if (this.state.value !== SIDENAV_STATE.CLOSE) {
      this.state.next(SIDENAV_STATE.CLOSE);
    }
  }

}

@Injectable({
  providedIn: 'root'
})
export class SidenavControllerService {

  private sidenavs: { [id: string]: Sidenav } = {};

  constructor() {
    this.createSidenav('default');
  }

  private chechSidenavExists(id: string) {
    if (!this.sidenavs[id]) {
      throw new Error(`SidenavControllerService@openSidenav: Sidenav with id '${id}' does not exists.`);
    }
  }

  createSidenav(
    id: string,
    initialState: SIDENAV_STATE = SIDENAV_STATE.CLOSE
  ) {
    return this.sidenavs[id] = new Sidenav(id, initialState);
  }

  getSidenav(id: string) {
    return this.sidenavs[id];
  }

  openSidenav(id: string) {
    this.chechSidenavExists(id);
    this.getSidenav(id).open();
  }

  closeSidenav(id: string) {
    this.chechSidenavExists(id);
    this.getSidenav(id).close();
  }

}
