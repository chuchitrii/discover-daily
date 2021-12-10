import { Service } from 'fastify-decorators';
import { OAuth2Token } from 'fastify-oauth2';
import { CookieSerializeOptions } from 'fastify-cookie';
import { CryptoService } from './crypto.service';

@Service()
export class SharedService {
  constructor(private crypto: CryptoService) {}

  public encryptToken(token: OAuth2Token): string {
    return this.crypto.encrypt(JSON.stringify(token));
  }

  public decryptToken(token: string): OAuth2Token {
    return JSON.parse(this.crypto.decrypt(token));
  }

  public getCookieOptions(expireSeconds: number): CookieSerializeOptions {
    return {
      path: '/',
      httpOnly: true,
      secure: true,
      signed: true,
      expires: SharedService.addSecondsToDate(new Date(), expireSeconds),
      sameSite: 'strict',
    };
  }

  private static addSecondsToDate(date: Date, seconds: number) {
    return new Date(+date + seconds * 1000);
  }

}
