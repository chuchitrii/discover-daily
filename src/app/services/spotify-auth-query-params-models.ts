export class SpotifyAuthResponseQueryParams {
  'access_token='?: string;
  'token_type='?: string;
  'expires_in='?: string;
  'state='?: string;
  'error='?: string;
}
export class SpotifyAuthRequestQueryParams {
  'client_id=' = '6f1db9ac4bfa4cbc8c11d365774cd6d3';
  'response_type=' = 'token';
  'redirect_uri=' = 'http://localhost:8888/callback';
  'state=': string;
  'scope=' =
    'user-read-private user-read-email user-library-modify user-library-read playlist-modify-public playlist-modify-private';
  'show_dialog='?: string;
}
