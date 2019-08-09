import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterComponent } from './router/router.component';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SimpleLayoutComponent } from './simple-layout/simple-layout.component';
import { RoutingModule } from '../routing/routing.module';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule
  ],
  declarations: [
    RouterComponent,
    HeaderComponent,
    SidenavComponent,
    SimpleLayoutComponent
  ],
  exports: [
    SimpleLayoutComponent
  ]
})
export class NavigationModule { }
