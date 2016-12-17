/* global describe, it */
// Tests taken/merged from BN.js
//
// Copyright Fedor Indutny, 2014.
// https://github.com/indutny/bn.js/blob/master/test/bn-test.js

var assert = require('assert')
var BigInteger = require('../')

function newBI (str, radix) {
  if (str[0] === '-') {
    if (radix === 16) return BigInteger.fromString('' + parseInt(str, 16))
  }

  if (radix === 16) return BigInteger.fromHex(str)
  return BigInteger.fromString(str)
}

describe('BigInteger', function () {
  it('should work with String input', function () {
    assert.equal(newBI('12345').toString(16), '3039')
    assert.equal(newBI('29048849665247').toString(16), '1a6b765d8cdf')
    assert.equal(newBI('-29048849665247').toString(16), '-1a6b765d8cdf')
    assert.equal(newBI('1A6B765D8CDF', 16).toString(16), '1a6b765d8cdf')
    assert.equal(newBI('FF', 16).toString(), '255')
    assert.equal(newBI('1A6B765D8CDF', 16).toString(), '29048849665247')
//     assert.equal(newBI('a89c e5af8724 c0a23e0e 0ff77500', 16).toString(16), 'a89ce5af8724c0a23e0e0ff77500')
    assert.equal(newBI('0123456789abcdef123456789abcdef123456789abcdef', 16).toString(16), '123456789abcdef123456789abcdef123456789abcdef')
    assert.equal(newBI('10654321').toString(), '10654321')
    assert.equal(BigInteger.fromString('10000000000000000').toString(10), '10000000000000000')
  })

  it('should import/export twos complement big endian', function () {
    assert.equal(newBI('010203', 16).toString(16), '10203')
    assert.equal(newBI('01020304', 16).toString(16), '1020304')
    assert.equal(newBI('0102030405', 16).toString(16), '102030405')
    assert.equal(newBI('0102030405060708', 16).toString(16), '102030405060708')
    assert.equal(newBI('01020304', 16).toByteArray().join(','), '1,2,3,4')
    assert.equal(newBI('0102030405060708', 16).toByteArray().join(','), '1,2,3,4,5,6,7,8')
  })

  it('should return proper bitLength', function () {
    assert.equal(newBI('0').bitLength(), 0)
    assert.equal(newBI('01', 16).bitLength(), 1)
    assert.equal(newBI('02', 16).bitLength(), 2)
    assert.equal(newBI('03', 16).bitLength(), 2)
    assert.equal(newBI('04', 16).bitLength(), 3)
    assert.equal(newBI('08', 16).bitLength(), 4)
    assert.equal(newBI('10', 16).bitLength(), 5)
    assert.equal(newBI('0100', 16).bitLength(), 9)
    assert.equal(newBI('123456', 16).bitLength(), 21)
    assert.equal(newBI('0123456789', 16).bitLength(), 33)
    assert.equal(newBI('8023456789', 16).bitLength(), 40)
  })

  it('should return proper byteLength', function () {
    assert.equal(newBI('0').byteLength(), 0)
    assert.equal(newBI('01', 16).byteLength(), 0)
    assert.equal(newBI('02', 16).byteLength(), 0)
    assert.equal(newBI('03', 16).byteLength(), 0)
    assert.equal(newBI('04', 16).byteLength(), 0)
    assert.equal(newBI('08', 16).byteLength(), 0)
    assert.equal(newBI('10', 16).byteLength(), 0)
    assert.equal(newBI('0100', 16).byteLength(), 1)
    assert.equal(newBI('123456', 16).byteLength(), 2)
    assert.equal(newBI('0123456789', 16).byteLength(), 4)
    assert.equal(newBI('8023456789', 16).byteLength(), 5)
  })

  it('should add numbers', function () {
    assert.equal(newBI('14').add(newBI('26')).toString(16), '28')
    var k = newBI('1234', 16)
    var r = k
    for (var i = 0; i < 257; i++)
      r = r.add(k)
    assert.equal(r.toString(16), '125868')

    var k = newBI('abcdefabcdefabcdef', 16)
    var r = newBI('deadbeef', 16)

    for (var i = 0; i < 257; i++) {
      r = r.add(k)
    }

    assert.equal(r.toString(16), 'ac79bd9b79be7a277bde')
  })

  it('should subtract numbers', function () {
    assert.equal(newBI('14').subtract(newBI('26')).toString(16), '-c')
    assert.equal(newBI('26').subtract(newBI('14')).toString(16), 'c')
    assert.equal(newBI('26').subtract(newBI('26')).toString(16), '0')
    assert.equal(newBI('-26').subtract(newBI('26')).toString(16), '-34')

    var a = newBI('031ff3c61db2db84b9823d320907a573f6ad37c437abe458b1802cda041d6384a7d8daef41395491e2', 16)
    var b = newBI('6f0e4d9f1d6071c183677f601af9305721c91d31b0bbbae8fb790000', 16)
    var r = newBI('031ff3c61db2db84b9823d3208989726578fd75276287cd9516533a9acfb9a6776281f34583ddb91e2', 16)
    assert.equal(a.subtract(b).compareTo(r), 0)

    var r = b.subtract(newBI('14'))
    assert.equal(b.clone().subtract(newBI('14')).compareTo(r), 0)

    var r = newBI('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b', 16)
    assert.equal(r.subtract(newBI('-1')).toString(16), '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681c')

    // Carry and copy
    var a = newBI('012345', 16)
    var b = newBI('01000000000000', 16)
    assert.equal(a.subtract(b).toString(16), '-fffffffedcbb')
    assert.equal(b.subtract(a).toString(16), 'fffffffedcbb')
  })

  it('should multiply numbers', function () {
    assert.equal(newBI('1001', 16).multiply(newBI('1234', 16)).toString(16), '1235234')
    assert.equal(newBI('-1001', 16).multiply(newBI('1234', 16)).toString(16), '-1235234')
    assert.equal(newBI('-1001', 16).multiply(newBI('-1234', 16)).toString(16), '1235234')
    var n = newBI('1001', 16)
    var r = n

    for (var i = 0; i < 4; i++) {
      r = r.multiply(n)
    }

    assert.equal(r.toString(16), '100500a00a005001')

    var n = newBI('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16)
    assert.equal(n.multiply(n).toString(16), '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9978a8bd8acaa40')
    assert.equal(n.multiply(n).multiply(n).toString(16), '1b888e01a06e974017a28a5b4da436169761c9730b7aeedf75fc60f687b46e0cf2cb11667f795d5569482640fe5f628939467a01a612b023500d0161e9730279a7561043af6197798e41b7432458463e64fa81158907322dc330562697d0d600')

    assert.equal(newBI('-100000000000').multiply(newBI('3').divide(newBI('4'))).toString(16), '0')
  })

  it('should divide numbers', function () {
    assert.equal(newBI('10').divide(newBI('256')).toString(16), '0')
    assert.equal(newBI('69527932928').divide(newBI('16974594')).toString(16), 'fff')
    assert.equal(newBI('-69527932928').divide(newBI('16974594')).toString(16), '-fff')

    var b = newBI('39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9978a8bd8acaa40', 16)
    var n = newBI('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16)
    assert.equal(b.divide(n).toString(16), n.toString(16))

    assert.equal(newBI('1').divide(newBI('-5')).toString(10), '0')

    // Regression after moving to word div
    var p = newBI('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16)
    var a = newBI('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16)
    var as = a.square()
    assert.equal(as.divide(p).toString(16), '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729e58090b9')
    var p = newBI('ffffffff00000001000000000000000000000000ffffffffffffffffffffffff', 16)
    var a = newBI('fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
    assert.equal(a.divide(p).toString(16), 'ffffffff00000002000000000000000000000001000000000000000000000001')
  })

  it('should mod numbers', function () {
    assert.equal(newBI('10').mod(newBI('256')).toString(16), 'a')
    assert.equal(newBI('69527932928').mod(newBI('16974594')).toString(16), '102f302')
    assert.equal(newBI('-69527932928').mod(newBI('16974594')).toString(16), '1000')
    assert.equal(newBI('10', 16).mod(newBI('256')).toString(16), '10')
    assert.equal(newBI('0100', 16).mod(newBI('256')).toString(16), '0')
    assert.equal(newBI('1001', 16).mod(newBI('256')).toString(16), '1')
    assert.equal(newBI('100000000001', 16).mod(newBI('256')).toString(16), '1')
    assert.equal(newBI('100000000001', 16).mod(newBI('257')).toString(16), newBI('100000000001', 16).mod(newBI('257')).toString(16))
    assert.equal(newBI('123456789012', 16).mod(newBI('3')).toString(16), newBI('123456789012', 16).mod(newBI('3')).toString(16))

    var p = newBI('ffffffff00000001000000000000000000000000ffffffffffffffffffffffff', 16)
    var a = newBI('fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
    assert.equal( a.mod(p).toString(16), '0')
  })

  it('should shiftLeft numbers', function () {
    assert.equal(newBI('69527932928').shiftLeft(13).toString(16), '2060602000000')
    assert.equal(newBI('69527932928').shiftLeft(45).toString(16), '206060200000000000000')
  })

  it('should shiftRight numbers', function () {
    assert.equal(newBI('69527932928').shiftRight(13).toString(16), '818180')
    assert.equal(newBI('69527932928').shiftRight(17).toString(16), '81818')
    assert.equal(newBI('69527932928').shiftRight(256).toString(16), '0')
  })

  it('should modInverse numbers', function () {
    var p = newBI('257')
    var a = newBI('3')
    var b = a.modInverse(p)
    assert.equal(a.multiply(b).mod(p).toString(16), '1')

    var p192 = newBI('fffffffffffffffffffffffffffffffeffffffffffffffff', 16)
    var a = newBI('deadbeef', 16)
    var b = a.modInverse(p192)
    assert.equal(a.multiply(b).mod(p192).toString(16), '1')
  })

  it('should throw on modInverse of 0', function () {
    var p = newBI('257')
    var a = newBI('0')

    assert.throws(function () {
      a.modInverse(p)
    }, /division by zero/)
  })

  it('modInverse should always return a positive number', function () {
    var z = newBI('cc61934972bba029382f0bef146b228ca15d54f7e38b6cd5f6b382398b7a97a8', 16)
    var p = newBI('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16)
    var zInv = z.modInverse(p)
    assert.strictEqual(zInv.signum(), 1, 'zInv should be positive')
  })

  it('should calculate if probable prime', function () {
    // not prime
    var a = newBI('561')
    assert.ok(!a.isProbablePrime())

    // not prime, but `true` returned anyways because test is probabilistic
    var p = newBI('25326001')
    assert.ok(p.isProbablePrime())
  })
})
