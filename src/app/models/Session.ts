import { Address } from './Address';

/**
 * @summary The batting model.
 */
export class Session
 {
     constructor(
         public key: String  = '',
         public createdAt: number  = Date.now(),
         public address: Address = new Address(),
         public isUsed: Boolean = false)
     {
     }
 }
