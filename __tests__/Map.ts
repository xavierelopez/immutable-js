///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import Immutable = require('immutable');
import Map = Immutable.Map;

describe('Map', () => {

  it('converts from object', () => {
    var m = Map.from({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values', () => {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values as array of entries', () => {
    var m = Map([['a','A'],['b','B'],['c','C']]);
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values as sequence', () => {
    var s = Immutable.LazySequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var m = Map(s);
    expect(m.size).toBe(3);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor is identity when provided map', () => {
    var m1 = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var m2 = Map(m1);
    expect(m2).toBe(m1);
  });

  it('constructor does not accept a scalar', () => {
    expect(() => {
      Map(3);
    }).toThrow('Expected iterable: 3');
  });

  it('from does not accept a scalar', () => {
    expect(() => {
      Map.from(3);
    }).toThrow('Expected iterable: 3');
  });

  it('constructor does not accept a scalar', () => {
    expect(() => {
      Map([1,2,3]);
    }).toThrow('Expected [K, V] tuple: 1');
  });

  it('from does not accept a non-entries array', () => {
    expect(() => {
      Map.from([1,2,3]);
    }).toThrow('Expected [K, V] tuple: 1');
  });

  it('converts back to JS object', () => {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.toObject()).toEqual({'a': 'A', 'b': 'B', 'c': 'C'});
  });

  it('iterates values', () => {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var iterator = jest.genMockFunction();
    m.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      ['A', 'a', m],
      ['B', 'b', m],
      ['C', 'c', m]
    ]);
  });

  it('merges two maps', () => {
    var m1 = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var m2 = Map({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    expect(m2.toObject()).toEqual({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    var m3 = m1.merge(m2);
    expect(m3.toObject()).toEqual({'a': 'A', 'b': 'BB', 'c': 'C', 'wow': 'OO', 'd': 'DD'});
  });

  it('accepts null as a key', () => {
    var m1 = Map();
    var m2 = m1.set(null, 'null');
    var m3 = m2.remove(null);
    expect(m1.size).toBe(0);
    expect(m2.size).toBe(1);
    expect(m3.size).toBe(0);
    expect(m2.get(null)).toBe('null');
  });

  it('is persistent to sets', () => {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.set('b', 'Bonobo');
    expect(m1.size).toBe(0);
    expect(m2.size).toBe(1);
    expect(m3.size).toBe(2);
    expect(m4.size).toBe(3);
    expect(m5.size).toBe(3);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.get('b')).toBe('Bonobo');
  });

  it('is persistent to deletes', () => {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.remove('b');
    expect(m1.size).toBe(0);
    expect(m2.size).toBe(1);
    expect(m3.size).toBe(2);
    expect(m4.size).toBe(3);
    expect(m5.size).toBe(2);
    expect(m3.has('b')).toBe(true);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.has('b')).toBe(false);
    expect(m5.get('b')).toBe(undefined);
    expect(m5.get('c')).toBe('Canary');
  });

  it('deletes down to empty map', () => {
    var m1 = Map({a:'A', b:'B', c:'C'});
    var m2 = m1.remove('a');
    var m3 = m2.remove('b');
    var m4 = m3.remove('c');
    expect(m1.size).toBe(3);
    expect(m2.size).toBe(2);
    expect(m3.size).toBe(1);
    expect(m4.size).toBe(0);
    expect(m4).toBe(Map.empty());
  });

  it('can map many items', () => {
    var m = Map();
    for (var ii = 0; ii < 2000; ii++) {
       m = m.set('thing:' + ii, ii);
    }
    expect(m.size).toBe(2000);
    expect(m.get('thing:1234')).toBe(1234);
  });

  it('can map items known to hash collide', () => {
    var m = Map().set('AAA', 'letters').set(64545, 'numbers');
    expect(m.size).toBe(2);
    expect(m.get('AAA')).toEqual('letters');
    expect(m.get(64545)).toEqual('numbers');
  });

  it('can progressively add items known to collide', () => {
    var map = Map();
    map = map.set('@', '@');
    map = map.set(64, 64);
    map = map.set(96, 96);
    expect(map.size).toBe(3);
    expect(map.get('@')).toBe('@');
    expect(map.get(64)).toBe(64);
    expect(map.get(96)).toBe(96);
  });

  it('maps values', () => {
    var m = Map({a:'a', b:'b', c:'c'});
    var r = m.map(value => value.toUpperCase());
    expect(r.toObject()).toEqual({a:'A', b:'B', c:'C'});
  });

  it('maps keys', () => {
    var m = Map({a:'a', b:'b', c:'c'});
    var r = m.mapKeys(value => value.toUpperCase());
    expect(r.toObject()).toEqual({A:'a', B:'b', C:'c'});
  });

  it('filters values', () => {
    var m = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    var r = m.filter(value => value % 2 === 1);
    expect(r.toObject()).toEqual({a:1, c:3, e:5});
  });

  it('filterNots values', () => {
    var m = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    var r = m.filterNot(value => value % 2 === 1);
    expect(r.toObject()).toEqual({b:2, d:4, f:6});
  });

  it('derives keys', () => {
    var v = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    expect(v.keySeq().toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('flips keys and values', () => {
    var v = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    expect(v.flip().toObject()).toEqual({1:'a', 2:'b', 3:'c', 4:'d', 5:'e', 6:'f'});
  });

  it('can convert to a vector', () => {
    var m = Map({a:1, b:2, c:3});
    var v = m.toVector();
    var k = m.keySeq().toVector();
    expect(v.size).toBe(3);
    expect(k.size).toBe(3);
    // Note: Map has undefined ordering, this Vector may not be the same
    // order as the order you set into the Map.
    expect(v.get(1)).toBe(2);
    expect(k.get(1)).toBe('b');
  });

  check.it('works like an object', {maxSize: 50}, [gen.object(gen.JSONPrimitive)], obj => {
    var map = Immutable.Map.from(obj);
    Object.keys(obj).forEach(key => {
      expect(map.get(key)).toBe(obj[key]);
      expect(map.has(key)).toBe(true);
    });
    Object.keys(obj).forEach(key => {
      expect(map.get(key)).toBe(obj[key]);
      expect(map.has(key)).toBe(true);
      map = map.remove(key);
      expect(map.get(key)).toBe(undefined);
      expect(map.has(key)).toBe(false);
    });
  });

  check.it('sets', {maxSize: 5000}, [gen.posInt], len => {
    var map = Immutable.Map();
    for (var ii = 0; ii < len; ii++) {
      expect(map.size).toBe(ii);
      map = map.set(''+ii, ii);
    }
    expect(map.size).toBe(len);
    expect(Immutable.is(map.toSet(), Immutable.Range(0, len).toSet())).toBe(true);
  });

  check.it('has and get', {maxSize: 5000}, [gen.posInt], len => {
    var map = Immutable.Range(0, len).mapKeys(x => ''+x).toMap();
    for (var ii = 0; ii < len; ii++) {
      expect(map.get(''+ii)).toBe(ii);
      expect(map.has(''+ii)).toBe(true);
    }
  });

  check.it('deletes', {maxSize: 5000}, [gen.posInt], len => {
    var map = Immutable.Range(0, len).toMap();
    for (var ii = 0; ii < len; ii++) {
      expect(map.size).toBe(len - ii);
      map = map.remove(ii);
    }
    expect(map.size).toBe(0);
    expect(map.toObject()).toEqual({});
  });

  check.it('deletes from transient', {maxSize: 5000}, [gen.posInt], len => {
    var map = Immutable.Range(0, len).toMap().asMutable();
    for (var ii = 0; ii < len; ii++) {
      expect(map.size).toBe(len - ii);
      map.remove(ii);
    }
    expect(map.size).toBe(0);
    expect(map.toObject()).toEqual({});
  });

  check.it('iterates through all entries', [gen.posInt], len => {
    var v = Immutable.Range(0, len).toMap();
    var a = v.toArray();
    var iter = v.entries();
    for (var ii = 0; ii < len; ii++) {
      delete a[ iter.next().value[0] ];
    }
    expect(a).toEqual(new Array(len));
  });

  it('allows chained mutations', () => {
    var m1 = Map();
    var m2 = m1.set('a', 1);
    var m3 = m2.withMutations(m => m.set('b', 2).set('c', 3));
    var m4 = m3.set('d', 4);

    expect(m1.toObject()).toEqual({});
    expect(m2.toObject()).toEqual({'a':1});
    expect(m3.toObject()).toEqual({'a': 1, 'b': 2, 'c': 3});
    expect(m4.toObject()).toEqual({'a': 1, 'b': 2, 'c': 3, 'd': 4});
  });

});
