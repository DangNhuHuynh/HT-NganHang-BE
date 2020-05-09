const ERRORS = {
  PARTNER_DOESNT_EXISTS: {
    code: 10001,
    message: 'Partner doesn\'t exits.',
  },
  INVALID_HASH: {
    code: 10002,
    message: 'Invalid body, hash is different with body content.',
  },
  REQUEST_EXPIRED: {
    code: 10003,
    message: 'Request has expired, request timestamp is $1, server ts is $2',
  },
  PUBLIC_KEY_DOESNT_EXISTS: {
    code: 10004,
    message: 'Public key of partner bank doesn\'t exists.',
  },
  INVALID_SIGNATURE: {
    code: 10005,
    message: 'Invalid signature.',
  },
  INVALID_REQUEST_BODY: {
    code: 20001,
    message: 'Invalid request body.',
  },
  ACCOUNT_DOESNT_EXISTS: {
    code: 20002,
    message: 'Account doesn\'t exits.',
  },
  BALANCE_DOESNT_ENOUGH: {
    code: 20003,
    message: 'balance doesn\'t enough to exec this transaction.',
  },
  UNKOWN: {
    code: 99999,
    message: 'UNKOWN ERROR.',
  }
}

module.exports = ERRORS
