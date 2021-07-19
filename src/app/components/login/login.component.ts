import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { DeviceService } from '../../services/device/device.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private auth: AuthService, public device: DeviceService) {}

  ngOnInit(): void {}

  redirect(): void {
    this.auth.redirectToSpotify();
  }
}
