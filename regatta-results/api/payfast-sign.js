import crypto from 'node:crypto';

const MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID  || '34560187';
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || 'a1ae0boxxeipe';
const PASSPHRASE   = process.env.PAYFAST_PASSPHRASE   || '';
const ITEM_NAME    = 'Regatta Results SA Donation';
const MIN_AMOUNT   = 5;

/**
 * PayFast signature: MD5 of "key=urlencoded(value)&..." + optional passphrase.
 * Fields must be in declaration order — do NOT sort alphabetically.
 */
function generateSignature(fields) {
  let str = Object.entries(fields)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&');

  if (PASSPHRASE) {
    str += `&passphrase=${encodeURIComponent(PASSPHRASE).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(str).digest('hex');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const amount = parseFloat(req.body?.amount);
  if (!amount || isNaN(amount) || amount < MIN_AMOUNT) {
    return res.status(400).json({ error: `Minimum donation is R${MIN_AMOUNT}` });
  }

  // Build origin from request host so it works on any deployment URL
  const proto  = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${req.headers.host}`;

  const fields = {
    merchant_id:  MERCHANT_ID,
    merchant_key: MERCHANT_KEY,
    return_url:   `${origin}/?donated=1`,
    cancel_url:   `${origin}/#donate`,
    amount:       amount.toFixed(2),
    item_name:    ITEM_NAME,
  };

  return res.status(200).json({
    ...fields,
    signature: generateSignature(fields),
  });
}
