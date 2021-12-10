import crypto from 'crypto';
import { FastifyInstanceToken, getInstanceByToken, Service } from 'fastify-decorators';
import { FastifyInstance } from 'fastify';

@Service()
export class CryptoService {
  fastify: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  private algorithm = 'aes-256-ctr';
  private secretKey = Buffer.from(this.fastify.config.cookieSecret, 'hex');
  private iv = Buffer.from(this.fastify.config.cookieSalt, 'hex');

  public encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return encrypted.toString('hex');
  };

  public decrypt(text: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, this.iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(text, 'hex')), decipher.final()]);
    return decrypted.toString('ascii');
  };

}
