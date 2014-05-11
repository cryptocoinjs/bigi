// FIXME: Kind of a weird way to throw exceptions, consider removing
var assert = require('assert')
var BigInteger = require('./bigi')

/**
 * Turns a byte array into a big integer.
 *
 * This function will interpret a byte array as a big integer in big
 * endian notation.
 */
BigInteger.fromByteArrayUnsigned = function(byteArray) {
  // BigInteger expects a DER integer conformant byte array
  if (byteArray[0] & 0x80) {
    return new BigInteger([0].concat(byteArray))
  }

  return new BigInteger(byteArray)
}

/**
 * Returns a byte array representation of the big integer.
 *
 * This returns the absolute of the contained value in big endian
 * form. A value of zero results in an empty array.
 */
BigInteger.prototype.toByteArrayUnsigned = function() {
  var byteArray = this.toByteArray()
  return byteArray[0] === 0 ? byteArray.slice(1) : byteArray
}

BigInteger.fromDERInteger = function(byteArray) {
  return new BigInteger(byteArray)
}

/*
 * Converts BigInteger to a DER integer representation.
 *
 * The format for this value uses the most significant bit as a sign
 * bit.  If the most significant bit is already set and the integer is
 * positive, a 0x00 is prepended.
 *
 * Examples:
 *
 *      0 =>     0x00
 *      1 =>     0x01
 *     -1 =>     0x81
 *    127 =>     0x7f
 *   -127 =>     0xff
 *    128 =>   0x0080
 *   -128 =>     0x80
 *    255 =>   0x00ff
 *   -255 =>     0xff
 *  16300 =>   0x3fac
 * -16300 =>   0xbfac
 *  62300 => 0x00f35c
 * -62300 =>   0xf35c
*/
BigInteger.prototype.toDERInteger = BigInteger.prototype.toByteArray

/// this could easily be
/*   function fromHex(s) {
        return new BigInteger(s, 16)
      }

//consider changing, see: cryptocoinjs/bigi/ #1
*/

BigInteger.fromHex = function(hex) {
  var buffer = new Buffer(hex, 'hex')
  assert.equal(buffer.length, Buffer.byteLength(hex) / 2)

  return BigInteger.fromBuffer(buffer)
}

BigInteger.fromBuffer = function(buffer) {
  assert(Buffer.isBuffer(buffer))

  var array = Array.prototype.slice.call(buffer)
  return BigInteger.fromByteArrayUnsigned(array)
}

BigInteger.prototype.toBuffer = function(size) {
  var buffer = new Buffer(this.toByteArrayUnsigned())
  var padded = new Buffer(size - buffer.length)
  padded.fill(0)

  return Buffer.concat([padded, buffer], size)
}

BigInteger.prototype.toHex = function(size) {
  return this.toBuffer(size).toString('hex')
}
