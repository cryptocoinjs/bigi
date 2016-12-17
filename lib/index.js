var BigInteger = require('./bigi')

// addons
require('./convert')

function fromString (string) {
  if (typeof string !== 'string') throw new TypeError('Expected String')

  var a = new BigInteger()
  a.fromString(string)
  return a
}

module.exports = {
  ZERO: BigInteger.ZERO,
  ONE: BigInteger.ONE,
  fromBuffer: BigInteger.fromBuffer,
  fromByteArrayUnsigned: BigInteger.fromByteArrayUnsigned,
  fromDERInteger: BigInteger.fromDERInteger,
  fromHex: BigInteger.fromHex,
  fromString: fromString
}
