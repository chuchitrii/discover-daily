import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly isMobileResolution: boolean;

  constructor() {
    this.isMobileResolution = window.innerWidth < 768;
  }

  public getIsMobileResolution(): boolean {
    return this.isMobileResolution;
  }
}
