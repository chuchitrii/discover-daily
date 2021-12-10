import { CookieSerializeOptions } from 'fastify-cookie';

export const cookieOptions: CookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  secure: true,
  signed: true,
  sameSite: 'strict',
}
