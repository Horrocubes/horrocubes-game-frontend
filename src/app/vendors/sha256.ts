export class Sha256
{
    static hash(message: string, options?: any): string {
        const defaults = { messageFormat: 'string', outputFormat: 'hex' };
        const optional = Object.assign(defaults, options);
        const sha256Hash: string[] = [];

        switch (optional.messageFormat) {
            case 'string':
                message = utf8Encode(message);
                break;
            case 'hex-bytes':
                message = hexBytesToString(message);
                break;
            default:
        }

        function utf8Encode(message: string) {
            try {
                return new TextEncoder().encode(message).reduce((prev, curr) => prev + String.fromCharCode(curr), '');
            } catch (e) {
                return unescape(encodeURIComponent(message));
            }
        }

        function hexBytesToString(message: string) {
            const str = message.replace(' ', '');
            return str == '' ? '' : str.match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
        }

        function pad(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
          }

        // sequence of constant words K^0,...,K^64
        const K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2 ];

        // initial hash value H^0,...,H^7
        const H = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];

        // preprocessing
        // append the bit "1" to the end of the message
        message += String.fromCharCode(0x80);

        // convert string message into 512-bit blocks (array of 16 32-bit integers) [§5.2.1]
        const l = message.length / 4 + 2; // length (in 32-bit integers) of message + ‘1’ + appended length
        const N = Math.ceil(l / 16);  // number of 16-integer (512-bit) blocks required to hold 'l' ints
        const M = new Array(N);     // message M is N×16 array of 32-bit integers

        for (let i = 0; i < N; i++) {
            M[i] = new Array(16);
            // big-endian encoding -encode 4 chars per integer
            for (let j = 0; j < 16; j++) {
                M[i][j] = (message.charCodeAt(i * 64 + j * 4 + 0) << 24) | (message.charCodeAt(i * 64 + j * 4 + 1) << 16)
                        | (message.charCodeAt(i * 64 + j * 4 + 2) << 8) | (message.charCodeAt(i * 64 + j * 4 + 3) << 0);
            }
        }

        const lenHi = ((message.length - 1) * 8) / Math.pow(2, 32);
        const lenLo = ((message.length - 1) * 8) >>> 0;
        M[N - 1][14] = Math.floor(lenHi);
        M[N - 1][15] = lenLo;


        // main-loop
        for (let i = 0; i < N; i++) {
            const W = new Array(64);

            // 1 - prepare message
            for (let t = 0;  t < 16; t++) {
                W[t] = M[i][t];
            }
            for (let t = 16; t < 64; t++) {
                W[t] = (Sha256.σ1(W[t - 2]) + W[t - 7] + Sha256.σ0(W[t - 15]) + W[t - 16]) >>> 0;
            }

            // 2 - initialise register
            let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

            // 3 - main loop SHA-256 compression function
            for (let t = 0; t < 64; t++) {
                const T1 = h + Sha256.Σ1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
                const T2 =     Sha256.Σ0(a) + Sha256.Maj(a, b, c);
                h = g;
                g = f;
                f = e;
                e = (d + T1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (T1 + T2) >>> 0;
            }

            // 4 - compute the intermediate hash value
            H[0] = (H[0] + a) >>> 0;
            H[1] = (H[1] + b) >>> 0;
            H[2] = (H[2] + c) >>> 0;
            H[3] = (H[3] + d) >>> 0;
            H[4] = (H[4] + e) >>> 0;
            H[5] = (H[5] + f) >>> 0;
            H[6] = (H[6] + g) >>> 0;
            H[7] = (H[7] + h) >>> 0;
        }

        // convert H^0,...,H^7 to hex strings (with leading zeros)
        for (let h = 0; h < H.length; h++) {
            sha256Hash[h] = pad(H[h].toString(16), 8, '0');
        }

        const separator = optional.outFormat == 'hex-w' ? ' ' : '';
        return sha256Hash.join(separator);
    }


    // Rotation
    static ROTR(n: number, x: number) {
        return (x >>> n) | (x << (32 - n));
    }

    // Logical functions
    static Σ0(x: number) {
        return Sha256.ROTR(2,  x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x);
    }
    static Σ1(x: number) {
        return Sha256.ROTR(6,  x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x);
    }
    static σ0(x: number) {
        return Sha256.ROTR(7,  x) ^ Sha256.ROTR(18, x) ^ (x >>> 3);
    }
    static σ1(x: number) {
        return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x >>> 10);
    }
    static Ch(x: number, y: number, z: number)  {
        return (x & y) ^ (~x & z);
    }          // 'choice'
    static Maj(x: number, y: number, z: number) {
        return (x & y) ^ (x & z) ^ (y & z);
    } // 'majority'

    hex2a(hexx) {
        const hex = hexx.toString(); // force conversion
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
      }
}
