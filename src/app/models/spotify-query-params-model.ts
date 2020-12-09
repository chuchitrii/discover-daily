export class SpotifyAuthResponseQueryParams {
  access_token?: string;
  token_type?: string;
  expires_in?: string;
  state?: string;
  error?: string;
}
export class SpotifyAuthRequestQueryParams {
  client_id: string;
  response_type: string;
  redirect_uri: string;
  state: string;
  scope: string;
  show_dialog?: string;

  constructor() {
    this.client_id = '6f1db9ac4bfa4cbc8c11d365774cd6d3';
    this.response_type = 'token';
    this.redirect_uri = 'http://localhost:8888/callback';
    this.scope =
      'user-read-private user-read-email user-library-modify user-library-read playlist-modify-public playlist-modify-private';
  }
}
