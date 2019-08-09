import { Component, OnInit } from '@angular/core';
import { SidenavControllerService, SIDENAV_STATE } from 'src/app/services/sidenav-controller.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {


  constructor(
    private sidenavCtrl: SidenavControllerService
  ) {}

  ngOnInit() {
  }

}
