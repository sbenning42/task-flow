import { TestBed, inject } from '@angular/core/testing';

import { SidenavControllerService } from './sidenav-controller.service';

describe('SidenavControllerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SidenavControllerService]
    });
  });

  it('should be created', inject([SidenavControllerService], (service: SidenavControllerService) => {
    expect(service).toBeTruthy();
  }));
});
