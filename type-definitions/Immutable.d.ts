/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Immutable Data
 * ==============
 *
 * Immutable data encourages pure functions (data-in, data-out) and lends itself
 * to much simpler application development and enabling techniques from
 * functional programming such as lazy evaluation.
 *
 * While designed to bring these powerful functional concepts to JavaScript, it
 * presents an Object-Oriented API familiar to Javascript engineers and closely
 * mirroring that of Array, Map, and Set. It is easy and efficient to convert to
 * and from plain Javascript types.
 */

declare module 'immutable' {

  /**
   * `Immutable.is()` has the same semantics as Object.is(), but treats immutable
   * sequences as data, equal if the second immutable sequences contains
   * equivalent data. It's used throughout when checking for equality.
   *
   *     var map1 = Immutable.Map({a:1, b:1, c:1});
   *     var map2 = Immutable.Map({a:1, b:1, c:1});
   *     assert(map1 !== map2);
   *     assert(Object.is(map1, map2) === false);
   *     assert(Immutable.is(map1, map2) === true);
   *
   */
  export function is(first: any, second: any): boolean;

  /**
   * `Immutable.fromJS()` deeply converts plain JS objects and arrays to
   * Immutable sequences.
   *
   * If a `converter` is optionally provided, it will be called with every
   * sequence (beginning with the most nested sequences and proceeding to the
   * original sequence itself), along with the key refering to this Iterable
   * and the parent JS object provided as `this`. For the top level, object,
   * the key will be "". This `converter` is expected to return a new Iterable,
   * allowing for custom convertions from deep JS objects.
   *
   * This example converts JSON to Vector and OrderedMap:
   *
   *     Immutable.fromJS({a: {b: [10, 20, 30]}, c: 40}, function (value, key) {
   *       var isIndexed = Immutable.Sequence.isIndexed(value);
   *       console.log(isIndexed, key, this);
   *       return isIndexed ? value.toVector() : value.toOrderedMap();
   *     });
   *
   *     // true, "b", {b: [10, 20, 30]}
   *     // false, "a", {a: {b: [10, 20, 30]}, c: 40}
   *     // false, "", {"": {a: {b: [10, 20, 30]}, c: 40}}
   *
   * If `converter` is not provided, the default behavior will convert Arrays into
   * Vectors and Objects into Maps.
   *
   * Note: `converter` acts similarly to [`reviver`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter)
   * in `JSON.parse`.
   */
  export function fromJS(
    json: any,
    converter?: (k: any, v: Iterable<any, any>) => any
  ): any;



  /**
   * Iterable
   * --------
   *
   * The `Iterable` is a set of (key, value) entries which can be iterated, and
   * is the base class for all collections in `immutable`, allowing them to
   * make use of all the Iterable methods (such as `map` and `filter`).
   *
   * Note: An iterable is always iterated in the same order, however that order
   * may not always be well defined, as is the case for the `Map` and `Set`.
   */
  export module Iterable {

    /**
     * `Immutable.Iterable.from()` returns a particular kind of Iterable based
     * on the input.
     *
     *   * If a `Iterable`, that same `Iterable`.
     *   * If an Array, an `IndexedIterable`.
     *   * If an Iterable, an `IndexedIterable`.
     *   * If an Iterator, an `IndexedIterable`.
     *   * If a plain Object, a `KeyedIterable`.
     *
     */
    function from<K, V>(iterable: Iterable<K, V>): Iterable<K, V>;
    function from<T>(array: Array<T>): IndexedIterable<T>;
    function from<V>(obj: {[key: string]: V}): Iterable<string, V>;
    function from<T>(iterator: Iterator<T>): IndexedIterable<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): IndexedIterable<T>;

    /**
     * True if `maybeIterable` is an Iterable, or any of its subclasses.
     */
    function isIterable(maybeIterable): boolean;

    /**
     * True if `maybeKeyed` is a KeyedIterable, or any of its subclasses.
     */
    function isKeyed(maybeKeyed): boolean;

    /**
     * True if `maybeIndexed` is a IndexedIterable, or any of its subclasses.
     */
    function isIndexed(maybeIndexed): boolean;

    /**
     * True if `maybeAssociative` is either a keyed or indexed Iterable.
     */
    function isAssociative(maybeAssociative): boolean;

  }

  /**
   * Like `Immutable.Iterable.from()`, `Immutable.Iterable()` returns a
   * Iterable from a iterable-like, but also accepts a non-sequenceable value
   * which becomes an Iterable of that one value.
   *
   * This method is useful when converting from an any arbitrary value to a
   * Iterable but changes the behavior for JS objects and strings. Only plain
   * Objects (e.g. created as `{}`) will be converted to Sequences. If you want
   * to ensure that a Iterable of one item is returned, use `Sequence.of`, if
   * you want to force a conversion of objects and strings to Iterables, use
   * `Iterable.from`.
   */
  export function Iterable<K, V>(iterable: Iterable<K, V>): Iterable<K, V>;
  export function Iterable<T>(array: Array<T>): IndexedIterable<T>;
  export function Iterable<V>(obj: {[key: string]: V}): KeyedIterable<string, V>;
  export function Iterable<T>(iterator: Iterator<T>): IndexedIterable<T>;
  export function Iterable<T>(iterable: /*ES6Iterable<T>*/Object): IndexedIterable<T>;
  export function Iterable<V>(value: V): IndexedIterable<V>;


  export interface Iterable<K, V> {

    // ### Conversion to other types

    /**
     * Converts this sequence to an Array, discarding keys.
     */
    toArray(): Array<V>;

    /**
     * Converts this sequence to an indexed sequence of the values of this
     * sequence, discarding keys.
     */
    toIndexedSeq(): LazyIndexedSequence<V>;

    /**
     * Deeply converts this sequence to equivalent JS.
     *
     * IndexedSequences, Vectors, Ranges, Repeats and Sets become Arrays, while
     * other Sequences become Objects.
     */
    toJS(): any;

    /**
     * Converts this sequence into an identical sequence where indices are
     * treated as keys. This is useful if you want to operate on an
     * IndexedIterable and preserve the [index, value] pairs.
     *
     * The returned Sequence will have identical iteration order as
     * this Sequence.
     *
     * Example:
     *
     *     var indexedSeq = Immutable.Iterable.of('A', 'B', 'C');
     *     indexedSeq.filter(v => v === 'B').toString() // Seq [ 'B' ]
     *     var keyedSeq = indexedSeq.toKeyedSeq();
     *     keyedSeq.filter(v => v === 'B').toString() // Seq { 1: 'B' }
     *
     */
    toKeyedSeq(): LazyKeyedSequence<K, V>;

    /**
     * Converts this sequence to a Map, Throws if keys are not hashable.
     *
     * Note: This is equivalent to `Map.from(this.toKeyedSeq())`, but provided
     * for convenience and to allow for chained expressions.
     */
    toMap(): Map<K, V>;

    /**
     * Converts this sequence to an Object. Throws if keys are not strings.
     */
    toObject(): { [key: string]: V };

    /**
     * Converts this sequence to a Map, maintaining the order of iteration.
     *
     * Note: This is equivalent to `OrderedMap.from(this.toKeyedSeq())`, but
     * provided for convenience and to allow for chained expressions.
     */
    toOrderedMap(): Map<K, V>;

    /**
     * Converts this sequence to a Set, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Set.from(this)`, but provided to allow for
     * chained expressions.
     */
    toSet(): Set<V>;

    /**
     * Converts this sequence to an set sequence of the values of this
     * sequence, discarding keys.
     */
    toSetSeq(): LazySetSequence<V>;

    /**
     * Converts this sequence to a lazy sequence of the same kind (indexed,
     * keyed, or set).
     */
    toSeq(): LazySequence<K, V>;

    /**
     * Converts this sequence to a Stack, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Stack.from(this)`, but provided to allow for
     * chained expressions.
     */
    toStack(): Stack<V>;

    /**
     * Converts this sequence to a Vector, discarding keys.
     *
     * Note: This is equivalent to `Vector.from(this)`, but provided to allow
     * for chained expressions.
     */
    toVector(): Vector<V>;


    // ### Common JavaScript methods and properties

    /**
     * Deeply converts this sequence to a string.
     */
    toString(): string;

    /**
     * Some sequences can describe their size lazily. When this is the case,
     * size will be an integer. Otherwise it will be undefined.
     *
     * For example, the new Sequences returned from map() or reverse()
     * preserve the size of the original sequence while filter() does not.
     *
     * Note: All original collections will have a size, including Maps,
     * Vectors, Sets, Ranges, Repeats and Sequences made from
     * Arrays and Objects.
     */
    size: number;


    // ### ES6 Collection methods (ES6 Array and Map)

    /**
     * Returns a new Iterable of the same type with other values and
     * iterable-like concatenated to this one.
     *
     * For LazySequences, all entries will be present in
     * the resulting iterable, even if they have the same key.
     */
    concat(...valuesOrIterables: any[]): /*this*/Iterable<any, any>;

    /**
     * True if a value exists within this Iterable.
     */
    contains(value: V): boolean;

    /**
     * An iterator of this Map's entries as [key, value] tuples.
     */
    entries(): Iterator</*[K, V]*/Array<any>>;

    /**
     * True if `predicate` returns true for all entries in the sequence.
     */
    every(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): boolean;

    /**
     * Returns a new Iterable of the same type with only the entries for which
     * the `predicate` function returns true.
     *
     *     LazySequence({a:1,b:2,c:3,d:4}).filter(x => x % 2 === 0)
     *     // Seq { b: 2, d: 4 }
     *
     */
    filter(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns the value for which the `predicate` returns true.
     */
    find(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): V;

    /**
     * The `sideEffect` is executed for every entry in the sequence.
     *
     * Unlike `Array.prototype.forEach`, if any call of `sideEffect` returns
     * `false`, the iteration will stop. Returns the number of entries iterated
     * (including the last iteration which returned false).
     */
    forEach(
      sideEffect: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => any,
      context?: any
    ): number;

    /**
     * Joins values together as a string, inserting a separator between each.
     * The default separator is ",".
     */
    join(separator?: string): string;

    /**
     * An iterator of this Iterable's keys.
     */
    keys(): Iterator<K>;

    /**
     * Returns a new Iterable of the same type with values passed through a
     * `mapper` function.
     *
     *     LazySequence({ a: 1, b: 2 }).map(x => 10 * x)
     *     // Seq { a: 10, b: 20 }
     *
     */
    map<M>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => M,
      context?: any
    ): /*this*/Iterable<K, M>;

    /**
     * Reduces the Iterable to a value by calling the `reducer` for every entry
     * in the Iterable and passing along the reduced value.
     *
     * If `initialReduction` is not provided, or is null, the first item in the
     * Iterable will be used.
     *
     * @see `Array.prototype.reduce`.
     */
    reduce<R>(
      reducer: (reduction?: R, value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * Reduces the Iterable in reverse (from the right side).
     *
     * Note: Similar to this.reverse().reduce(), and provided for parity
     * with `Array#reduceRight`.
     */
    reduceRight<R>(
      reducer: (reduction?: R, value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * Returns a new Iterable of the same type in reverse order.
     */
    reverse(): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type representing a portion of this
     * Iterable from start up to but not including end.
     *
     * If begin is negative, it is offset from the end of the Iterable. e.g.
     * `slice(-2)` returns a Iterable of the last two entries. If it is not
     * provided the new Iterable will begin at the beginning of this Iterable.
     *
     * If end is negative, it is offset from the end of the Iterable. e.g.
     * `slice(0, -1)` returns an Iterable of everything but the last entry. If
     * it is not provided, the new Iterable will continue through the end of
     * this Iterable.
     *
     * If the requested slice is equivalent to the current Iterable, then it
     * will return itself.
     */
    slice(begin?: number, end?: number): /*this*/Iterable<K, V>;

    /**
     * True if `predicate` returns true for any entry in the Iterable.
     */
    some(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): boolean;

    /**
     * Returns a new Iterable of the same type which contains the same entries,
     * stably sorted by using a `comparator`.
     *
     * If a `comparator` is not provided, a default comparator uses `<` and `>`.
     *
     * `comparator(valueA, valueB)`:
     *
     *   * Returns `0` if the elements should not be swapped.
     *   * Returns `-1` (or any negative number) if `valueA` comes before `valueB`
     *   * Returns `1` (or any positive number) if `valueA` comes after `valueB`
     *   * Is pure, i.e. it must always return the same value for the same pair
     *     of values.
     */
    sort(comparator?: (valueA: V, valueB: V) => number): /*this*/Iterable<K, V>;

    /**
     * An iterator of this Map's values.
     */
    values(): Iterator<V>;


    // ### More collection methods

    /**
     * Returns a new Iterable of the same type containing all entries except
     * the last.
     */
    butLast(): /*this*/Iterable<K, V>;

    /**
     * Regardless of if this Iterable can describe its size (some LazySequences
     * cannot), this method will always return the correct size. E.g. it
     * evaluates a LazySequence if necessary.
     *
     * If `predicate` is provided, then this returns the count of entries in the
     * Iterable for which the `predicate` returns true.
     */
    count(): number;
    count(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): number;

    /**
     * Returns a `LazyKeyedSequence` of counts, grouped by the return value of
     * the `grouper` function.
     *
     * Note: This is not a lazy operation.
     */
    countBy<G>(
      grouper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => G,
      context?: any
    ): LazyKeyedSequence<G, number>;

    /**
     * True if this and the other Iterable have value equality, as defined
     * by `Immutable.is()`.
     *
     * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
     * allow for chained expressions.
     */
    equals(other: Iterable<K, V>): boolean;

    /**
     * Returns a new LazyIndexedSequence of [key, value] tuples.
     */
    entrySeq(): LazyIndexedSequence</*(K, V)*/Array<any>>;

    /**
     * Returns a new Iterable of the same type with only the entries for which
     * the `predicate` function returns false.
     *
     *     LazySequence({a:1,b:2,c:3,d:4}).filterNot(x => x % 2 === 0)
     *     // Seq { a: 1, c: 3 }
     *
     */
    filterNot(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns the key for which the `predicate` returns true.
     */
    findKey(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): K;

    /**
     * Returns the last value for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLast(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): V;

    /**
     * Returns the last key for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLastKey(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): K;

    /**
     * The first value in the Iterable.
     */
    first(): V;

    /**
     * Flat-maps the Iterable, returning an Iterable of the same type.
     */
    flatMap<MK, MV>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => Iterable<MK, MV>,
      context?: any
    ): /*this*/Iterable<MK, MV>;

    /**
     * Flattens nested Iterables.
     *
     * Will deeply flatten the Iterable by default, returning an Iterable of the
     * same type, but a `depth` can be provided in the form of a number or
     * boolean (where true means to shallowly flatten one level). A depth of 0
     * (or shallow: false) will deeply flatten.
     *
     * Flattens only others Iterable, not Arrays or Objects.
     *
     * Note: `flatten(true)` operates on Iterable<any, Iterable<K, V>> and
     * returns Iterable<K, V>
     */
    flatten(depth?: number): /*this*/Iterable<any, any>;
    flatten(shallow?: boolean): /*this*/Iterable<any, any>;

    /**
     * Returns the value associated with the provided key, or notSetValue if
     * the Iterable does not contain this key.
     *
     * Note: it is possible a key may be associated with an `undefined` value, so
     * if `notSetValue` is not provided and this method returns `undefined`,
     * that does not guarantee the key was not found.
     */
    get(key: K, notSetValue?: V): V;

    /**
     * Returns the value found by following a key path through nested Iterables.
     */
    getIn(searchKeyPath: Array<any>, notSetValue?: any): any;

    /**
     * Returns a `KeyedIterable` of `KeyedIterables`, grouped by the return
     * value of the `grouper` function.
     *
     * Note: This is not a lazy operation.
     */
    groupBy<G>(
      grouper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => G,
      context?: any
    ): LazyKeyedSequence<G, /*this*/Iterable<K, V>>;

    /**
     * True if a key exists within this Iterable.
     */
    has(key: K): boolean;

    /**
     * True if `iter` contains every value in this Iterable.
     */
    isSubset(iter: Iterable<any, V>): boolean;
    isSubset(iter: Array<V>): boolean;

    /**
     * True if this Iterable contains every value in `iter`.
     */
    isSuperset(iter: Iterable<any, V>): boolean;
    isSuperset(iter: Array<V>): boolean;

    /**
     * Returns a new LazyIndexedSequence of the keys of this Iterable,
     * discarding values.
     */
    keySeq(): LazyIndexedSequence<K>;

    /**
     * The last value in the Iterable.
     */
    last(): V;

    /**
     * Returns the maximum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Iterable#sort`. If it is not
     * provided, the default comparator is `a > b`.
     */
    max(comparator?: (valueA: V, valueB: V) => number): V;

    /**
     * Like `max`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.maxBy(hitter => hitter.avgHits);
     *
     */
    maxBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V;

    /**
     * Returns the maximum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Iterable#sort`. If it is not
     * provided, the default comparator is `a > b`.
     */
    min(comparator?: (valueA: V, valueB: V) => number): V;

    /**
     * Like `min`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.minBy(hitter => hitter.avgHits);
     *
     */
    minBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V;

    /**
     * Returns a new Iterable of the same type containing all entries except
     * the first.
     */
    rest(): /*this*/Iterable<K, V>

    /**
     * Returns a new Iterable of the same type which excludes the first `amount`
     * entries from this Iterable.
     */
    skip(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which excludes the last `amount`
     * entries from this Iterable.
     */
    skipLast(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries starting
     * from when `predicate` first returns false.
     *
     *     LazySequence.of('dog','frog','cat','hat','god')
     *       .skipWhile(x => x.match(/g/))
     *     // Seq [ 'cat', 'hat', 'god' ]
     *
     */
    skipWhile(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries starting
     * from when `predicate` first returns true.
     *
     *     LazySequence.of('dog','frog','cat','hat','god')
     *       .skipUntil(x => x.match(/hat/))
     *     // Seq [ 'hat', 'god' ]
     *
     */
    skipUntil(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
     * sorting by more sophisticated means:
     *
     *     hitters.sortBy(hitter => hitter.avgHits);
     *
     */
    sortBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains the first `amount`
     * entries from this Iterable.
     */
    take(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains the last `amount`
     * entries from this Iterable.
     */
    takeLast(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries from this
     * Iterable as long as the `predicate` returns true.
     *
     *     LazySequence.of('dog','frog','cat','hat','god')
     *       .takeWhile(x => x.match(/o/))
     *     // Seq [ 'dog', 'frog' ]
     *
     */
    takeWhile(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries from this
     * Iterable as long as the `predicate` returns false.
     *
     *     LazySequence.of('dog','frog','cat','hat','god').takeUntil(x => x.match(/at/))
     *     // ['dog', 'frog']
     *
     */
    takeUntil(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new LazyIndexedSequence of the values of this Iterable,
     * discarding keys.
     */
    valueSeq(): LazyIndexedSequence<V>;
  }


  /**
   * Keyed Iterable
   * --------------
   *
   * Keyed Iterables have discrete keys tied to each value.
   *
   * When iterating `KeyedIterable`, each iteration will yield a `[K, V]` tuple,
   * in other words, `Iterable#entries` is the default iterator for Keyed
   * Sequences.
   */

  export module KeyedIterable {

    /**
     * Similar to `Iterable.from`, however it expects iterable-likes of [K, V]
     * tuples if not constructed from a KeyedIterable or JS Object.
     */
    function from<K, V>(iter: KeyedIterable<K, V>): KeyedIterable<K, V>;
    function from<K, V>(iter: Iterable<any, /*[K,V]*/Array<any>>): KeyedIterable<K, V>;
    function from<K, V>(array: Array</*[K,V]*/Array<any>>): KeyedIterable<K, V>;
    function from<V>(obj: {[key: string]: V}): KeyedIterable<string, V>;
    function from<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): KeyedIterable<K, V>;
    function from<K, V>(iterable: /*Iterable<[K,V]>*/Object): KeyedIterable<K, V>;

  }

  /**
   * Alias for `KeyedIterable.from`.
   */
  export function KeyedIterable<K, V>(iter: KeyedIterable<K, V>): KeyedIterable<K, V>;
  export function KeyedIterable<K, V>(iter: Iterable<any, /*[K,V]*/any>): KeyedIterable<K, V>;
  export function KeyedIterable<K, V>(array: Array</*[K,V]*/any>): KeyedIterable<K, V>;
  export function KeyedIterable<V>(obj: {[key: string]: V}): KeyedIterable<string, V>;
  export function KeyedIterable<K, V>(iterator: Iterator</*[K,V]*/any>): KeyedIterable<K, V>;
  export function KeyedIterable<K, V>(iterable: /*Iterable<[K,V]>*/Object): KeyedIterable<K, V>;


  export interface KeyedIterable<K, V> extends Iterable<K, V> {

    /**
     * Returns LazyKeyedSequence.
     * @override
     */
    toSeq(): LazyKeyedSequence<K, V>;


    /**
     * Returns a new KeyedIterable of the same type where the keys and values
     * have been flipped.
     *
     *     LazySequence({ a: 'z', b: 'y' }).flip() // { z: 'a', y: 'b' }
     *
     */
    flip(): /*this*/KeyedIterable<V, K>;

    /**
     * Returns a new KeyedIterable of the same type with entries
     * ([key, value] tuples) passed through a `mapper` function.
     *
     *     LazySequence({ a: 1, b: 2 })
     *       .mapEntries(([k, v]) => [k.toUpperCase(), v * 2])
     *     // Seq { A: 2, B: 4 }
     *
     */
    mapEntries<KM, VM>(
      mapper: (entry?: /*(K, V)*/Array<any>, index?: number, iter?: /*this*/KeyedIterable<K, V>) => /*[KM, VM]*/Array<any>,
      context?: any
    ): /*this*/KeyedIterable<KM, VM>;

    /**
     * Returns a new KeyedIterable of the same type with keys passed through a
     * `mapper` function.
     *
     *     LazySequence({ a: 1, b: 2 })
     *       .mapKeys(x => x.toUpperCase())
     *     // Seq { A: 1, B: 2 }
     *
     */
    mapKeys<M>(
      mapper: (key?: K, value?: V, iter?: /*this*/KeyedIterable<K, V>) => M,
      context?: any
    ): KeyedIterable<M, V>;

    // TODO: All sequence methods return KeyedIterable here.
  }


  /**
   * Set Iterable
   * ------------
   *
   * Set Sequences only represent values. They have no associated keys or
   * indices. Duplicate values are possible in LazySetSequences, however the
   * concrete `Set` does not allow duplicate values.
   *
   * Iterable methods on SetIterable such as `map` and `forEach` will provide
   * the value as both the first and second arguments to the provided function.
   *
   *     var seq = LazySetSequence.of('A', 'B', 'C');
   *     assert.equal(seq.every((v, k) => v === k), true);
   *
   */

  export module SetIterable {

    /**
     * @see Iterable.from
     */
    function from<T>(iter: Iterable<any, T>): SetIterable<T>;
    function from<T>(array: Array<T>): SetIterable<T>;
    function from<T>(obj: {[key: string]: T}): SetIterable<T>;
    function from<T>(iterator: Iterator<T>): SetIterable<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): SetIterable<T>;

  }

  /**
   * Alias for `SetIterable.from`.
   */
  export function SetIterable<T>(iter: Iterable<any, T>): SetIterable<T>;
  export function SetIterable<T>(array: Array<T>): SetIterable<T>;
  export function SetIterable<T>(obj: {[key: string]: T}): SetIterable<T>;
  export function SetIterable<T>(iterator: Iterator<T>): SetIterable<T>;
  export function SetIterable<T>(iterable: /*Iterable<T>*/Object): SetIterable<T>;


  export interface SetIterable<T> extends Iterable<T, T> {

    /**
     * Returns LazySetSequence.
     * @override
     */
    toSeq(): LazySetSequence<T>;

    // TODO: All sequence methods return SetIterable here.
  }


  /**
   * Indexed Iterable
   * ----------------
   *
   * Indexed Sequences have incrementing numeric keys. They exhibit
   * slightly different behavior than `KeyedIterable` for some methods in order
   * to better mirror the behavior of JavaScript's `Array`, and add others which
   * do not make sense on non-indexed Iterables such as `indexOf`.
   *
   * Unlike JavaScript arrays, `IndexedIterable`s are always dense. "Unset"
   * indices and `undefined` indices are indistinguishable, and all indices from
   * 0 to `size` are visited when iterated.
   *
   * All IndexedIterable methods return re-indexed Sequences. In other words,
   * indices always start at 0 and increment until size. If you wish to
   * preserve indices, using them as keys, convert to a KeyedIterable by calling
   * `toKeyedSeq`.
   */

  export module IndexedIterable {

    /**
     * @see Iterable.from
     */
    function from<T>(iter: Iterable<any, T>): IndexedIterable<T>;
    function from<T>(array: Array<T>): IndexedIterable<T>;
    function from<T>(obj: {[key: string]: T}): IndexedIterable<T>;
    function from<T>(iterator: Iterator<T>): IndexedIterable<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): IndexedIterable<T>;

  }

  /**
   * Alias for `IndexedIterable.from`.
   */
  export function IndexedIterable<T>(iter: Iterable<any, T>): IndexedIterable<T>;
  export function IndexedIterable<T>(array: Array<T>): IndexedIterable<T>;
  export function IndexedIterable<T>(obj: {[key: string]: T}): IndexedIterable<T>;
  export function IndexedIterable<T>(iterator: Iterator<T>): IndexedIterable<T>;
  export function IndexedIterable<T>(iterable: /*Iterable<T>*/Object): IndexedIterable<T>;


  export interface IndexedIterable<T> extends Iterable<number, T> {

    /**
     * Returns LazyIndexedSequence.
     * @override
     */
    toSeq(): LazyIndexedSequence<T>;

    // ### ES6 Collection methods (ES6 Array and Map)

    /**
     * This new behavior will iterate through the values and iterable-likes with
     * increasing indices.
     * @override
     */
    concat(...valuesOrIterables: any[]): IndexedIterable<any>;

    /**
     * Predicate takes IndexedIterable.
     * @override
     */
    every(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): boolean;

    /**
     * Returns IndexedIterable.
     * @override
     */
    filter(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): /*this*/IndexedIterable<T>;

    /**
     * Predicate takes IndexedIterable.
     * @override
     */
    find(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any,
      notSetValue?: T
    ): T;

    /**
     * Returns the first index in the sequence where a value satisfies the
     * provided predicate function. Otherwise -1 is returned.
     */
    findIndex(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): number;

    /**
     * Side effect takes IndexedIterable.
     * @override
     */
    forEach(
      sideEffect: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => any,
      context?: any
    ): number;

    /**
     * Returns the first index at which a given value can be found in the
     * Iterable, or -1 if it is not present.
     */
    indexOf(searchValue: T): number;

    /**
     * Returns the last index at which a given value can be found in the
     * Iterable, or -1 if it is not present.
     */
    lastIndexOf(searchValue: T): number;

    /**
     * Returns an IndexedIterable
     * @override
     */
    map<M>(
      mapper: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => M,
      context?: any
    ): /*this*/IndexedIterable<M>;

    /**
     * Reducer takes IndexedIterable.
     * @override
     */
    reduce<R>(
      reducer: (reduction?: R, value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * Reducer takes IndexedIterable.
     * @override
     */
    reduceRight<R>(
      reducer: (reduction?: R, value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * Returns IndexedIterable.
     * @override
     */
    reverse(): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable.
     * @override
     */
    slice(begin?: number, end?: number): /*this*/IndexedIterable<T>;

    /**
     * Predicate takes IndexedIterable.
     * @override
     */
    some(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): boolean;

    /**
     * Returns an IndexedIterable
     * @override
     */
    sort(
      comparator?: (valueA: T, valueB: T) => number
    ): /*this*/IndexedIterable<T>;

    /**
     * Splice returns a new indexed sequence by replacing a region of this
     * Iterable with new values. If values are not provided, it only skips the
     * region to be removed.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * Iterable. `s.splice(-2)` splices after the second to last item.
     *
     *     LazySequence(['a','b','c','d']).splice(1, 2, 'q', 'r', 's')
     *     // Seq ['a', 'q', 'r', 's', 'd']
     *
     */
    splice(index: number, removeNum: number, ...values: any[]): /*this*/IndexedIterable<T>;


    // ### More sequential methods

    /**
     * Returns an IndexedIterable
     * @override
     */
    butLast(): /*this*/IndexedIterable<T>;

    /**
     * Predicate takes IndexedIterable.
     * @override
     */
    count(): number;
    count(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): number;

    /**
     * Returns an IndexedIterable
     * @override
     */
    filterNot(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): /*this*/IndexedIterable<T>;

    /**
     * Predicate takes IndexedIterable.
     * @override
     */
    findKey(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): number;

    /**
     * Predicate takes IndexedIterable.
     * @override
     */
    findLast(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any,
      notSetValue?: T
    ): T;

    /**
     * Returns the last index in the sequence where a value satisfies the
     * provided predicate function. Otherwise -1 is returned.
     */
    findLastIndex(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): number;

    /**
     * Predicate takes IndexedIterable.
     * @override
     */
    findLastKey(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): number;

    /**
     * Returns IndexedIterable<M>
     * @override
     */
    flatMap<M>(
      mapper: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => IndexedIterable<M>,
      context?: any
    ): /*this*/IndexedIterable<M>;
    flatMap<M>(
      mapper: (value?: T, index?: number, seq?: /*this*/IndexedIterable<T>) => M[],
      context?: any
    ): /*this*/IndexedIterable<M>;

    /**
     * Returns IndexedIterable<T>
     * @override
     */
    flatten(depth?: number): /*this*/IndexedIterable<any>;
    flatten(shallow?: boolean): /*this*/IndexedIterable<any>;

    /**
     * If this is a sequence of entries (key-value tuples), it will return a
     * sequence of those entries.
     */
    fromEntrySeq(): Iterable<any, any>;

    /**
     * Returns the value associated with the provided index, or notSetValue if
     * the index is beyond the bounds of the sequence.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * Iterable. `s.get(-1)` gets the last item in the Iterable.
     */
    get(index: number, notSetValue?: T): T;

    /**
     * Returns LazyKeyedIterable<G, IndexedIterable<T>>
     * @override
     */
    groupBy<G>(
      grouper: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => G,
      context?: any
    ): LazyKeyedSequence<G, any/*IndexedIterable<T>*/>; // Bug: exposing this causes the type checker to implode.

    /**
     * Returns an Iterable of the same type with `separator` between each item
     * in this Iterable.
     */
    interpose(separator: T): /*this*/IndexedIterable<T>;

    /**
     * Mapper takes IndexedIterable.
     * @override
     */
    maxBy<C>(
      comparatorValueMapper: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): T;

    /**
     * Mapper takes IndexedIterable.
     * @override
     */
    minBy<C>(
      comparatorValueMapper: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): T;

    /**
     * Returns IndexedIterable
     * @override
     */
    rest(): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    skip(amount: number): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    skipLast(amount: number): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    skipWhile(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    skipUntil(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): /*this*/IndexedIterable<T>;

    /**
     * Returns an IndexedIterable
     * @override
     */
    sortBy<C>(
      comparatorValueMapper: (value?: T, index?: number, iter?: IndexedIterable<T>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    take(amount: number): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    takeLast(amount: number): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    takeWhile(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): /*this*/IndexedIterable<T>;

    /**
     * Returns IndexedIterable
     * @override
     */
    takeUntil(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): /*this*/IndexedIterable<T>;
  }



  /**
   * Lazy Sequence
   * -------------
   *
   * **Sequences are immutable** — Once a sequence is created, it cannot be
   * changed, appended to, rearranged or otherwise modified. Instead, any mutative
   * method called on a sequence will return a new immutable sequence.
   *
   * **Sequences are lazy** — Sequences do as little work as necessary to respond
   * to any method call.
   *
   * For example, the following does no work, because the resulting sequence is
   * never used:
   *
   *     var oddSquares = Immutable.LazySequence.of(1,2,3,4,5,6,7,8)
   *       .filter(x => x % 2).map(x => x * x);
   *
   * Once the sequence is used, it performs only the work necessary. In this
   * example, no intermediate arrays are ever created, filter is only called
   * three times, and map is only called twice:
   *
   *     console.log(evenSquares.get(1)); // 9
   *
   * Lazy Sequences allow for the efficient chaining of sequence operations,
   * allowing for the expression of logic that can otherwise be very tedious:
   *
   *     Immutable.LazySequence({a:1, b:1, c:1})
   *       .flip().map(key => key.toUpperCase()).flip().toObject();
   *     // Map { A: 1, B: 1, C: 1 }
   *
   * As well as expressing logic that would otherwise seem memory-limited:
   *
   *     Immutable.Range(1, Infinity)
   *       .skip(1000)
   *       .map(n => -n)
   *       .filter(n => n % 2 === 0)
   *       .take(2)
   *       .reduce((r, n) => r * n, 1);
   *     // 1006008
   *
   */

  export module LazySequence {

    /**
     * `Immutable.LazySequence.from()` returns a particular kind of Sequence based
     * on the input.
     *
     *   * If a `LazySequence`, that same `LazySequence`.
     *   * If a `Iterable`, a `LazySequence` of the same kind.
     *   * If an Array, an `LazyIndexedSequence`.
     *   * If object with an iterator, an `LazyIndexedSequence`.
     *   * If an iterator, an `LazyIndexedSequence`.
     *   * If a plain Object, a `LazyKeyedSequence`.
     *
     */
    function from<K, V>(seq: Iterable<K, V>): LazySequence<K, V>;
    function from<T>(array: Array<T>): LazyIndexedSequence<T>;
    function from<V>(obj: {[key: string]: V}): LazySequence<string, V>;
    function from<T>(iterator: Iterator<T>): LazyIndexedSequence<T>;
    function from<T>(hasIterator: /*ES6Iterable<T>*/Object): LazyIndexedSequence<T>;

    /**
     * `LazySequence.empty()` returns a Lazy Sequence of no values.
     */
    function empty<K, V>(): LazySequence<K, V>;

    /**
     * Provides a Lazy Indexed Sequence of the values provided.
     */
    function of<T>(...values: T[]): LazyIndexedSequence<T>;

    /**
     * True if `maybeLazy` is a LazySequence, it is not backed by a concrete
     * structure such as Map, Vector, or Set.
     */
    function isLazy(maybeLazy): boolean;

  }

  /**
   * Like `Immutable.LazySequence.from()`, `Immutable.LazySequence()` returns a
   * lazy sequence from a sequenceable, but also accepts a non-sequenceable value
   * which becomes a Sequence of that one value, or 0 arguments to create an
   * empty Sequence.
   *
   * This method is useful when converting from an any arbitrary value to a
   * Sequence but changes the behavior for JS objects. Only plain Objects
   * (e.g. created as `{}`) will be converted to Sequences. If you want to
   * ensure that a Sequence of one item is returned, use `Sequence.of`, if you
   * want to force a conversion of objects to Sequences, use `Sequence.from`.
   */
  export function LazySequence<K, V>(): LazySequence<K, V>;
  export function LazySequence<K, V>(iterable: Iterable<K, V>): LazySequence<K, V>;
  export function LazySequence<T>(array: Array<T>): LazyIndexedSequence<T>;
  export function LazySequence<V>(obj: {[key: string]: V}): LazyKeyedSequence<string, V>;
  export function LazySequence<T>(iterator: Iterator<T>): LazyIndexedSequence<T>;
  export function LazySequence<T>(iterable: /*ES6Iterable<T>*/Object): LazyIndexedSequence<T>;
  export function LazySequence<V>(value: V): LazyIndexedSequence<V>;

  export interface LazySequence<K, V> extends Iterable<K, V> {

    /**
     * Because Sequences are lazy and designed to be chained together, they do
     * not cache their results. For example, this map function is called 6 times:
     *
     *     var squares = LazySequence.of(1,2,3).map(x => x * x);
     *     squares.join() + squares.join();
     *
     * If you know a derived sequence will be used multiple times, it may be more
     * efficient to first cache it. Here, map is called 3 times:
     *
     *     var squares = LazySequence.of(1,2,3).map(x => x * x).cacheResult();
     *     squares.join() + squares.join();
     *
     * Use this method judiciously, as it must fully evaluate a LazySequence.
     *
     * Note: after calling `cacheResult()`, a LazySequence will always have a size.
     */
    cacheResult(): /*this*/LazySequence<K, V>;
  }


  export module LazyKeyedSequence {

    function from<K, V>(seq: KeyedIterable<K, V>): LazyKeyedSequence<K, V>;
    function from<K, V>(seq: Iterable<any, /*[K,V]*/Array<any>>): LazyKeyedSequence<K, V>;
    function from<K, V>(array: Array</*[K,V]*/Array<any>>): LazyKeyedSequence<K, V>;
    function from<V>(obj: {[key: string]: V}): LazyKeyedSequence<string, V>;
    function from<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): LazyKeyedSequence<K, V>;
    function from<K, V>(iterable: /*Iterable<[K,V]>*/Object): LazyKeyedSequence<K, V>;

    function empty<K, V>(): LazySequence<K, V>;

  }

  /**
   * Alias for `LazyKeyedSequence.empty` and `LazyKeyedSequence.from`.
   */
  export function LazyKeyedSequence<K, V>(): LazyKeyedSequence<K, V>;
  export function LazyKeyedSequence<K, V>(seq: KeyedIterable<K, V>): LazyKeyedSequence<K, V>;
  export function LazyKeyedSequence<K, V>(seq: Iterable<any, /*[K,V]*/any>): LazyKeyedSequence<K, V>;
  export function LazyKeyedSequence<K, V>(array: Array</*[K,V]*/any>): LazyKeyedSequence<K, V>;
  export function LazyKeyedSequence<V>(obj: {[key: string]: V}): LazyKeyedSequence<string, V>;
  export function LazyKeyedSequence<K, V>(iterator: Iterator</*[K,V]*/any>): LazyKeyedSequence<K, V>;
  export function LazyKeyedSequence<K, V>(iterable: /*Iterable<[K,V]>*/Object): LazyKeyedSequence<K, V>;

  export interface LazyKeyedSequence<K, V> extends /*LazySequence<K, V>,*/ KeyedIterable<K, V> {
    //
    cacheResult(): /*this*/LazyKeyedSequence<K, V>;
  }


  export module LazySetSequence {

    /**
     * @see Iterable.from
     */
    function from<T>(seq: Iterable<any, T>): LazySetSequence<T>;
    function from<T>(array: Array<T>): LazySetSequence<T>;
    function from<T>(obj: {[key: string]: T}): LazySetSequence<T>;
    function from<T>(iterator: Iterator<T>): LazySetSequence<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): LazySetSequence<T>;

    function empty<T>(): LazySetSequence<T>;

    function of<T>(...values: T[]): LazySetSequence<T>;

  }

  /**
   * Alias for `LazySetSequence.empty` and `LazySetSequence.from`.
   */
  export function LazySetSequence<T>(): LazySetSequence<T>;
  export function LazySetSequence<T>(seq: Iterable<any, T>): LazySetSequence<T>;
  export function LazySetSequence<T>(array: Array<T>): LazySetSequence<T>;
  export function LazySetSequence<T>(obj: {[key: string]: T}): LazySetSequence<T>;
  export function LazySetSequence<T>(iterator: Iterator<T>): LazySetSequence<T>;
  export function LazySetSequence<T>(iterable: /*Iterable<T>*/Object): LazySetSequence<T>;

  export interface LazySetSequence<T> extends /*LazySequence<T, T>,*/ SetIterable<T> {
    //
    cacheResult(): /*this*/LazySetSequence<T>;
  }


  export module LazyIndexedSequence {

    /**
     * @see Iterable.from
     */
    function from<T>(seq: Iterable<any, T>): LazyIndexedSequence<T>;
    function from<T>(array: Array<T>): LazyIndexedSequence<T>;
    function from<T>(obj: {[key: string]: T}): LazyIndexedSequence<T>;
    function from<T>(iterator: Iterator<T>): LazyIndexedSequence<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): LazyIndexedSequence<T>;

    function empty<T>(): LazyIndexedSequence<T>;

    function of<T>(...values: T[]): LazyIndexedSequence<T>;

  }

  /**
   * Alias for `LazyIndexedSequence.empty` and `LazyIndexedSequence.from`.
   */
  export function LazyIndexedSequence<T>(): LazyIndexedSequence<T>;
  export function LazyIndexedSequence<T>(seq: Iterable<any, T>): LazyIndexedSequence<T>;
  export function LazyIndexedSequence<T>(array: Array<T>): LazyIndexedSequence<T>;
  export function LazyIndexedSequence<T>(obj: {[key: string]: T}): LazyIndexedSequence<T>;
  export function LazyIndexedSequence<T>(iterator: Iterator<T>): LazyIndexedSequence<T>;
  export function LazyIndexedSequence<T>(iterable: /*Iterable<T>*/Object): LazyIndexedSequence<T>;

  export interface LazyIndexedSequence<T> extends /*LazySequence<number, T>,*/ IndexedIterable<T> {
    //
    cacheResult(): /*this*/LazyIndexedSequence<T>;
  }


  /**
   * Range
   * -----
   *
   * Returns a lazy indexed sequence of numbers from `start` (inclusive) to `end`
   * (exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to
   * infinity. When `start` is equal to `end`, returns empty range.
   *
   *     Range() // [0,1,2,3,...]
   *     Range(10) // [10,11,12,13,...]
   *     Range(10,15) // [10,11,12,13,14]
   *     Range(10,30,5) // [10,15,20,25]
   *     Range(30,10,5) // [30,25,20,15]
   *     Range(30,30,5) // []
   *
   */
  export function Range(start?: number, end?: number, step?: number): LazyIndexedSequence<number>;


  /**
   * Repeat
   * ------
   *
   * Returns a lazy sequence of `value` repeated `times` times. When `times` is
   * not defined, returns an infinite sequence of `value`.
   *
   *     Repeat('foo') // ['foo','foo','foo',...]
   *     Repeat('bar',4) // ['bar','bar','bar','bar']
   *
   */
  export function Repeat<T>(value: T, times?: number): LazyIndexedSequence<T>;


  /**
   * Map
   * ---
   *
   * A Map is a Iterable of (key, value) pairs with `O(log32 N)` gets and sets.
   *
   * Map is a hash map and requires keys that are hashable, either a primitive
   * (string or number) or an object with a `hashCode(): number` method.
   *
   * Iteration order of a Map is undefined, however is stable. Multiple iterations
   * of the same Map will iterate in the same order.
   */

  export module Map {

    /**
     * `Map.empty()` creates a new immutable Map of size 0.
     */
    function empty<K, V>(): Map<K, V>;

    /**
     * `Map.from()` creates a new immutable Map with the same key value pairs as
     * the provided KeyedIterable or JavaScript Object or expects an Iterable
     * of [K, V] tuple entries.
     *
     *     var newMap = Map.from({key: "value"});
     *     var newMap = Map.from([["key", "value"]]);
     *
     */
    function from<K, V>(seq: KeyedIterable<K, V>): Map<K, V>;
    function from<K, V>(seq: Iterable<any, /*[K,V]*/Array<any>>): Map<K, V>;
    function from<K, V>(array: Array</*[K,V]*/Array<any>>): Map<K, V>;
    function from<V>(obj: {[key: string]: V}): Map<string, V>;
    function from<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): Map<K, V>;
    function from<K, V>(iterable: /*Iterable<[K,V]>*/Object): Map<K, V>;

  }

  /**
   * Alias for `Map.empty` and `Map.from`.
   */
  export function Map<K, V>(): Map<K, V>;
  export function Map<K, V>(seq: KeyedIterable<K, V>): Map<K, V>;
  export function Map<K, V>(seq: Iterable<any, /*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<K, V>(array: Array</*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<V>(obj: {[key: string]: V}): Map<string, V>;
  export function Map<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<K, V>(iterable: /*Iterable<[K,V]>*/Object): Map<K, V>;


  export interface Map<K, V> extends KeyedIterable<K, V> {

    /**
     * Returns a new Map also containing the new key, value pair. If an equivalent
     * key already exists in this Map, it will be replaced.
     */
    set(key: K, value: V): Map<K, V>;

    /**
     * Returns a new Map having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     */
    setIn(keyPath: Array<any>, value: V): Map<K, V>;

    /**
     * Returns a new Map which excludes this `key`.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias delete
     */
    remove(key: K): Map<K, V>;
    delete(key: K): Map<K, V>;

    /**
     * Returns a new Map having removed the value at this `keyPath`. If any keys
     * in `keyPath` do not exist, a new immutable Map will be created at
     * that key.
     */
    removeIn(keyPath: Array<any>): Map<K, V>;

    /**
     * Returns a new Map containing no keys or values.
     */
    clear(): Map<K, V>;

    /**
     * Returns a new Map having updated the value at this `key` with the return
     * value of calling `updater` with the existing value, or `notSetValue` if
     * the key was not set. If called with only a single argument, `updater` is
     * called with the Map itself.
     *
     * Equivalent to: `map.set(key, updater(map.get(key, notSetValue)))`.
     */
    update(updater: (value: Map<K, V>) => Map<K, V>): Map<K, V>;
    update(key: K, updater: (value: V) => V): Map<K, V>;
    update(key: K, notSetValue: V, updater: (value: V) => V): Map<K, V>;

    /**
     * Returns a new Map having applied the `updater` to the entry found at the
     * keyPath. If any keys in `keyPath` do not exist, a new immutable Map will
     * be created at that key. If the `keyPath` was not previously set,
     * `updater` is called with `notSetValue` (if provided).
     *
     *     var data = Immutable.fromJS({ a: { b: { c: 10 } } });
     *     data.updateIn(['a', 'b'], map => map.set('d', 20));
     *     // { a: { b: { c: 10, d: 20 } } }
     *
     */
    updateIn(
      keyPath: Array<any>,
      updater: (value: any) => any
    ): Map<K, V>;
    updateIn(
      keyPath: Array<any>,
      notSetValue: any,
      updater: (value: any) => any
    ): Map<K, V>;

    /**
     * Returns a new Map resulting from merging the provided Sequences
     * (or JS objects) into this Map. In other words, this takes each entry of
     * each sequence and sets it on this Map.
     *
     *     var x = Immutable.Map({a: 10, b: 20, c: 30});
     *     var y = Immutable.Map({b: 40, a: 50, d: 60});
     *     x.merge(y) // { a: 50, b: 40, c: 30, d: 60 }
     *     y.merge(x) // { b: 20, a: 10, d: 60, c: 30 }
     *
     */
    merge(...sequences: Iterable<K, V>[]): Map<K, V>;
    merge(...sequences: {[key: string]: V}[]): Map<string, V>;

    /**
     * Like `merge()`, `mergeWith()` returns a new Map resulting from merging the
     * provided Sequences (or JS objects) into this Map, but uses the `merger`
     * function for dealing with conflicts.
     *
     *     var x = Immutable.Map({a: 10, b: 20, c: 30});
     *     var y = Immutable.Map({b: 40, a: 50, d: 60});
     *     x.mergeWith((prev, next) => prev / next, y) // { a: 0.2, b: 0.5, c: 30, d: 60 }
     *     y.mergeWith((prev, next) => prev / next, x) // { b: 2, a: 5, d: 60, c: 30 }
     *
     */
    mergeWith(
      merger: (previous?: V, next?: V) => V,
      ...sequences: Iterable<K, V>[]
    ): Map<K, V>;
    mergeWith(
      merger: (previous?: V, next?: V) => V,
      ...sequences: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * Like `merge()`, but when two Sequences conflict, it merges them as well,
     * recursing deeply through the nested data.
     *
     *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
     *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
     *     x.mergeDeep(y) // {a: { x: 2, y: 10 }, b: { x: 20, y: 5 }, c: { z: 3 } }
     *
     */
    mergeDeep(...sequences: Iterable<K, V>[]): Map<K, V>;
    mergeDeep(...sequences: {[key: string]: V}[]): Map<string, V>;

    /**
     * Like `mergeDeep()`, but when two non-Sequences conflict, it uses the
     * `merger` function to determine the resulting value.
     *
     *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
     *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
     *     x.mergeDeepWith((prev, next) => prev / next, y)
     *     // {a: { x: 5, y: 10 }, b: { x: 20, y: 10 }, c: { z: 3 } }
     *
     */
    mergeDeepWith(
      merger: (previous?: V, next?: V) => V,
      ...sequences: Iterable<K, V>[]
    ): Map<K, V>;
    mergeDeepWith(
      merger: (previous?: V, next?: V) => V,
      ...sequences: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * Every time you call one of the above functions, a new immutable Map is
     * created. If a pure function calls a number of these to produce a final
     * return value, then a penalty on performance and memory has been paid by
     * creating all of the intermediate immutable Maps.
     *
     * If you need to apply a series of mutations to produce a new immutable
     * Map, `withMutations()` creates a temporary mutable copy of the Map which
     * can apply mutations in a highly performant manner. In fact, this is
     * exactly how complex mutations like `merge` are done.
     *
     * As an example, this results in the creation of 2, not 4, new Maps:
     *
     *     var map1 = Immutable.Map();
     *     var map2 = map1.withMutations(map => {
     *       map.set('a', 1).set('b', 2).set('c', 3);
     *     });
     *     assert(map1.size === 0);
     *     assert(map2.size === 3);
     *
     */
    withMutations(mutator: (mutable: Map<K, V>) => any): Map<K, V>;

    /**
     * Another way to avoid creation of intermediate Immutable maps is to create
     * a mutable copy of this collection. Mutable copies *always* return `this`,
     * and thus shouldn't be used for equality. Your function should never return
     * a mutable copy of a collection, only use it internally to create a new
     * collection. If possible, use `withMutations` as it provides an easier to
     * use API.
     *
     * Note: if the collection is already mutable, `asMutable` returns itself.
     */
    asMutable(): Map<K, V>;

    /**
     * The yin to `asMutable`'s yang. Because it applies to mutable collections,
     * this operation is *mutable* and returns itself. Once performed, the mutable
     * copy has become immutable and can be safely returned from a function.
     */
    asImmutable(): Map<K, V>;

    /**
     * When this cursor's (or any of its sub-cursors') `update` method is called,
     * the resulting new data structure will be provided to the `onChange`
     * function. Use this callback to keep track of the most current value or
     * update the rest of your application.
     */
    cursor(
      onChange?: (newValue: Map<K, V>, oldValue?: Map<K, V>, keyPath?: Array<any>) => void
    ): Cursor<Map<K, V>>;
    cursor(
      keyPath: Array<any>,
      onChange?: (newValue: Map<K, V>, oldValue?: Map<K, V>, keyPath?: Array<any>) => void
    ): Cursor<any>;
    cursor(
      key: K,
      onChange?: (newValue: Map<K, V>, oldValue?: Map<K, V>, keyPath?: Array<any>) => void
    ): Cursor<V>;
  }


  /**
   * Ordered Map
   * -----------
   *
   * OrderedMap constructors return a Map which has the additional guarantee of
   * the iteration order of entries to match the order in which they were set().
   * This makes OrderedMap behave similarly to native JS objects.
   */

  export module OrderedMap {

    /**
     * `OrderedMap.empty()` creates a new immutable ordered Map of size 0.
     */
    function empty<K, V>(): Map<K, V>;

    /**
     * `OrderedMap.from()` creates a new immutable ordered Map with the same key
     * value pairs as the provided KeyedIterable or JavaScript Object or expects
     * an Iterable of [K, V] tuple entries.
     *
     *     var newOrderedMap = OrderedMap.from({key: "value"});
     *     var newOrderedMap = OrderedMap.from([["key", "value"]]);
     *
     */
    function from<K, V>(seq: KeyedIterable<K, V>): Map<K, V>;
    function from<K, V>(seq: Iterable<any, /*[K,V]*/Array<any>>): Map<K, V>;
    function from<K, V>(array: Array</*[K,V]*/Array<any>>): Map<K, V>;
    function from<V>(obj: {[key: string]: V}): Map<string, V>;
    function from<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): Map<K, V>;
    function from<K, V>(iterable: /*Iterable<[K,V]>*/Object): Map<K, V>;

  }

  /**
   * Alias for `OrderedMap.empty` and `OrderedMap.from`.
   */
  export function OrderedMap<K, V>(): Map<K, V>;
  export function OrderedMap<K, V>(seq: KeyedIterable<K, V>): Map<K, V>;
  export function OrderedMap<K, V>(seq: Iterable<any, /*[K,V]*/Array<any>>): Map<K, V>;
  export function OrderedMap<K, V>(array: Array</*[K,V]*/Array<any>>): Map<K, V>;
  export function OrderedMap<V>(obj: {[key: string]: V}): Map<string, V>;
  export function OrderedMap<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): Map<K, V>;
  export function OrderedMap<K, V>(iterable: /*Iterable<[K,V]>*/Object): Map<K, V>;


  /**
   * Record
   * ------
   *
   * Creates a new Class which produces maps with a specific set of allowed string
   * keys and have default values.
   *
   *     var ABRecord = Record({a:1, b:2})
   *     var myRecord = new ABRecord({b:3})
   *
   * Records always have a value for the keys they define. `remove`ing a key
   * from a record simply resets it to the default value for that key.
   *
   *     myRecord.size // 2
   *     myRecordWithoutB = myRecord.remove('b')
   *     myRecordWithoutB.get('b') // 2
   *     myRecordWithoutB.size // 2
   *
   * Because Records have a known set of string keys, property get access works as
   * expected, however property sets will throw an Error.
   *
   *     myRecord.b // 3
   *     myRecord.b = 5 // throws Error
   *
   * Record Classes can be extended as well, allowing for custom methods on your
   * Record. This isn't how things are done in functional environments, but is a
   * common pattern in many JS programs.
   *
   *     class ABRecord extends Record({a:1,b:2}) {
   *       getAB() {
   *         return this.a + this.b;
   *       }
   *     }
   *
   *     var myRecord = new ABRecord(b:3)
   *     myRecord.getAB() // 4
   *
   */
  export function Record(defaultValues: Iterable<string, any>, name?: string): RecordClass;
  export function Record(defaultValues: {[key: string]: any}, name?: string): RecordClass;

  export interface RecordClass {
    new (): Map<string, any>;
    new (values: Iterable<string, any>): Map<string, any>;
    new (values: {[key: string]: any}): Map<string, any>;
  }


  /**
   * Set
   * ---
   *
   * A Set is a Iterable of unique values with `O(log32 N)` gets and sets.
   *
   * Sets, like Maps, require that their values are hashable, either a primitive
   * (string or number) or an object with a `hashCode(): number` method.
   *
   * When iterating a Set, the entries will be (value, value) pairs. Iteration
   * order of a Set is undefined, however is stable. Multiple iterations of the
   * same Set will iterate in the same order.
   */

  export module Set {

    /**
     * `Set.empty()` creates a new immutable Set of size 0.
     */
    function empty<T>(): Set<T>;

    /**
     * Create a new immutable Set containing the values of the provided
     * sequenceable.
     */
    function from<T>(seq: Iterable<any, T>): Set<T>;
    function from<T>(array: Array<T>): Set<T>;
    function from<T>(obj: {[key: string]: T}): Set<T>;
    function from<T>(iterator: Iterator<T>): Set<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): Set<T>;

    /**
     * `Set.fromKeys()` creates a new immutable Set containing the keys from
     * this Iterable or JavaScript Object.
     */
    function fromKeys<T>(seq: Iterable<T, any>): Set<T>;
    function fromKeys(obj: {[key: string]: any}): Set<string>;

    /**
     * Creates a new Set containing `values`.
     */
    function of<T>(...values: T[]): Set<T>;

  }

  /**
   * Alias for `Set.empty` and `Set.from`.
   */
  export function Set<T>(): Set<T>;
  export function Set<T>(seq: Iterable<any, T>): Set<T>;
  export function Set<T>(array: Array<T>): Set<T>;
  export function Set<T>(obj: {[key: string]: T}): Set<T>;
  export function Set<T>(iterator: Iterator<T>): Set<T>;
  export function Set<T>(iterable: /*Iterable<T>*/Object): Set<T>;


  export interface Set<T> extends SetIterable<T> {

    /**
     * Returns a new Set which also includes this value.
     */
    add(value: T): Set<T>;

    /**
     * Returns a new Set which excludes this value.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias delete
     */
    remove(value: T): Set<T>;
    delete(value: T): Set<T>;

    /**
     * Returns a new Set containing no values.
     */
    clear(): Set<T>;

    /**
     * Alias for `union`.
     * @see `Map.prototype.merge`
     */
    merge(...sequences: Iterable<any, T>[]): Set<T>;
    merge(...sequences: Array<T>[]): Set<T>;

    /**
     * Returns a Set including any value from `sequences` that does not already
     * exist in this Set.
     */
    union(...sequences: Iterable<any, T>[]): Set<T>;
    union(...sequences: Array<T>[]): Set<T>;

    /**
     * Returns a Set which has removed any values not also contained
     * within `sequences`.
     */
    intersect(...sequences: Iterable<any, T>[]): Set<T>;
    intersect(...sequences: Array<T>[]): Set<T>;

    /**
     * Returns a Set excluding any values contained within `sequences`.
     */
    subtract(...sequences: Iterable<any, T>[]): Set<T>;
    subtract(...sequences: Array<T>[]): Set<T>;

    /**
     * @see `Map.prototype.withMutations`
     */
    withMutations(mutator: (mutable: Set<T>) => any): Set<T>;

    /**
     * @see `Map.prototype.asMutable`
     */
    asMutable(): Set<T>;

    /**
     * @see `Map.prototype.asImmutable`
     */
    asImmutable(): Set<T>;
  }


  /**
   * Vector
   * ------
   *
   * Vectors are ordered indexed dense collections, much like a JavaScript
   * Array. Unlike a JavaScript Array, there is no distinction between an
   * "unset" index and an index set to `undefined`. `Vector#forEach` visits all
   * indices from 0 to size, regardless of if they are defined.
   */

  export module Vector {

    /**
     * `Vector.empty()` creates a new immutable Vector of size 0.
     */
    function empty<T>(): Vector<T>;

    /**
     * Create a new immutable Vector containing the values of the provided
     * sequenceable.
     */
    function from<T>(seq: Iterable<any, T>): Vector<T>;
    function from<T>(array: Array<T>): Vector<T>;
    function from<T>(obj: {[key: string]: T}): Vector<T>;
    function from<T>(iterator: Iterator<T>): Vector<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): Vector<T>;

    /**
     * Creates a new Vector containing `values`.
     */
    function of<T>(...values: T[]): Vector<T>;

  }

  /**
   * Alias for `Vector.empty` and `Vector.from`.
   */
  export function Vector<T>(): Vector<T>;
  export function Vector<T>(seq: Iterable<any, T>): Vector<T>;
  export function Vector<T>(array: Array<T>): Vector<T>;
  export function Vector<T>(obj: {[key: string]: T}): Vector<T>;
  export function Vector<T>(iterator: Iterator<T>): Vector<T>;
  export function Vector<T>(iterable: /*Iterable<T>*/Object): Vector<T>;


  export interface Vector<T> extends IndexedIterable<T> {

    /**
     * Returns a new Vector which includes `value` at `index`. If `index` already
     * exists in this Vector, it will be replaced.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * Vector. `v.set(-1, "value")` sets the last item in the Vector.
     */
    set(index: number, value: T): Vector<T>;

    /**
     * Returns a new Vector having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     */
    setIn(keyPath: Array<any>, value: T): Vector<T>;

    /**
     * Returns a new Vector which excludes this `index`. It will not affect the
     * size of the Vector, instead leaving an undefined value.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * Vector. `v.delete(-1)` deletes the last item in the Vector.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias delete
     */
    remove(index: number): Vector<T>;
    delete(index: number): Vector<T>;

    /**
     * Returns a new Vector having removed the value at this `keyPath`. If any
     * keys in `keyPath` do not exist, a new immutable Map will be created at
     * that key.
     */
    removeIn(keyPath: Array<any>): Vector<T>;

    /**
     * Returns a new Vector with 0 size and no values.
     */
    clear(): Vector<T>;

    /**
     * Returns a new Vector with the provided `values` appended, starting at this
     * Vector's `size`.
     */
    push(...values: T[]): Vector<T>;

    /**
     * Returns a new Vector with a size ones less than this Vector, excluding
     * the last index in this Vector.
     *
     * Note: this differs from `Array.prototype.pop` because it returns a new
     * Vector rather than the removed value. Use `last()` to get the last value
     * in this Vector.
     */
    pop(): Vector<T>;

    /**
     * Returns a new Vector with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     */
    unshift(...values: T[]): Vector<T>;

    /**
     * Returns a new Vector with a size ones less than this Vector, excluding
     * the first index in this Vector, shifting all other values to a lower index.
     *
     * Note: this differs from `Array.prototype.shift` because it returns a new
     * Vector rather than the removed value. Use `first()` to get the first
     * value in this Vector.
     */
    shift(): Vector<T>;

    /**
     * Returns a new Vector with an updated value at `index` with the return
     * value of calling `updater` with the existing value, or `notSetValue` if
     * `index` was not set. If called with a single argument, `updater` is
     * called with the Vector itself.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * Vector. `v.update(-1)` updates the last item in the Vector.
     *
     * @see Map.update
     */
    update(updater: (value: Vector<T>) => Vector<T>): Vector<T>;
    update(index: number, updater: (value: T) => T): Vector<T>;
    update(index: number, notSetValue: T, updater: (value: T) => T): Vector<T>;

    /**
     * @see `Map.prototype.updateIn`
     */
    updateIn(
      keyPath: Array<any>,
      updater: (value: any) => any
    ): Vector<T>;
    updateIn(
      keyPath: Array<any>,
      notSetValue: any,
      updater: (value: any) => any
    ): Vector<T>;

    /**
     * @see `Map.prototype.merge`
     */
    merge(...sequences: IndexedIterable<T>[]): Vector<T>;
    merge(...sequences: Array<T>[]): Vector<T>;

    /**
     * @see `Map.prototype.mergeWith`
     */
    mergeWith(
      merger: (previous?: T, next?: T) => T,
      ...sequences: IndexedIterable<T>[]
    ): Vector<T>;
    mergeWith(
      merger: (previous?: T, next?: T) => T,
      ...sequences: Array<T>[]
    ): Vector<T>;

    /**
     * @see `Map.prototype.mergeDeep`
     */
    mergeDeep(...sequences: IndexedIterable<T>[]): Vector<T>;
    mergeDeep(...sequences: Array<T>[]): Vector<T>;

    /**
     * @see `Map.prototype.mergeDeepWith`
     */
    mergeDeepWith(
      merger: (previous?: T, next?: T) => T,
      ...sequences: IndexedIterable<T>[]
    ): Vector<T>;
    mergeDeepWith(
      merger: (previous?: T, next?: T) => T,
      ...sequences: Array<T>[]
    ): Vector<T>;

    /**
     * Returns a new Vector with size `size`. If `size` is less than this
     * Vector's size, the new Vector will exclude values at the higher indices.
     * If `size` is greater than this Vector's size, the new Vector will have
     * undefined values for the newly available indices.
     */
    setSize(size: number): Vector<T>;

    /**
     * @see `Map.prototype.withMutations`
     */
    withMutations(mutator: (mutable: Vector<T>) => any): Vector<T>;

    /**
     * @see `Map.prototype.asMutable`
     */
    asMutable(): Vector<T>;

    /**
     * @see `Map.prototype.asImmutable`
     */
    asImmutable(): Vector<T>;

    /**
     * @see Map.cursor
     */
    cursor(
      onChange?: (newValue: Vector<T>, oldValue?: Vector<T>, keyPath?: Array<any>) => void
    ): Cursor<Vector<T>>;
    cursor(
      keyPath: Array<any>,
      onChange?: (newValue: Vector<T>, oldValue?: Vector<T>, keyPath?: Array<any>) => void
    ): Cursor<any>;
    cursor(
      key: number,
      onChange?: (newValue: Vector<T>, oldValue?: Vector<T>, keyPath?: Array<any>) => void
    ): Cursor<T>;
  }


  /**
   * Stack
   * -----
   *
   * Stacks are indexed collections which support very efficient addition and
   * removal from the front using `unshift(v)` and `shift()`.
   *
   * For familiarity, Stack also provides `push(v)`, `pop()`, and `peek()`, but
   * be aware that they also operate on the front of the list, unlike Vector or
   * a JavaScript Array.
   */

  export module Stack {

    /**
     * `Stack.empty()` creates a new immutable Stack of size 0.
     */
    function empty<T>(): Stack<T>;

    /**
     * Create a new immutable Stack containing the values of the provided
     * sequenceable.
     */
    function from<T>(seq: Iterable<any, T>): Stack<T>;
    function from<T>(array: Array<T>): Stack<T>;
    function from<T>(obj: {[key: string]: T}): Stack<T>;
    function from<T>(iterator: Iterator<T>): Stack<T>;
    function from<T>(iterable: /*Iterable<T>*/Object): Stack<T>;

    /**
     * Creates a new Stack containing `values`.
     */
    function of<T>(...values: T[]): Stack<T>;

  }

  /**
   * Alias for `Stack.empty` and `Stack.from`.
   */
  export function Stack<T>(): Stack<T>;
  export function Stack<T>(seq: Iterable<any, T>): Stack<T>;
  export function Stack<T>(array: Array<T>): Stack<T>;
  export function Stack<T>(obj: {[key: string]: T}): Stack<T>;
  export function Stack<T>(iterator: Iterator<T>): Stack<T>;
  export function Stack<T>(iterable: /*Iterable<T>*/Object): Stack<T>;


  export interface Stack<T> extends IndexedIterable<T> {

    /**
     * Returns a new Stack with 0 size and no values.
     */
    clear(): Stack<T>;

    /**
     * Returns a new Stack with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     *
     * This is very efficient for Stack.
     */
    unshift(...values: T[]): Stack<T>;

    /**
     * Like `Stack#unshift`, but accepts a sequencable rather than varargs.
     */
    unshiftAll(seq: Iterable<any, T>): Stack<T>;
    unshiftAll(seq: Array<T>): Stack<T>;

    /**
     * Returns a new Stack with a size ones less than this Stack, excluding
     * the first item in this Stack, shifting all other values to a lower index.
     *
     * Note: this differs from `Array.prototype.shift` because it returns a new
     * Stack rather than the removed value. Use `first()` or `peek()` to get the
     * first value in this Stack.
     */
    shift(): Stack<T>;

    /**
     * Alias for `Stack#unshift` and is not equivalent to `Vector#push`.
     */
    push(...values: T[]): Stack<T>;

    /**
     * Alias for `Stack#unshiftAll`.
     */
    pushAll(seq: Iterable<any, T>): Stack<T>;
    pushAll(seq: Array<T>): Stack<T>;

    /**
     * Alias for `Stack#shift` and is not equivalent to `Vector#pop`.
     */
    pop(): Stack<T>;

    /**
     * Alias for `Stack.first()`.
     */
    peek(): T;

    /**
     * @see `Map.prototype.withMutations`
     */
    withMutations(mutator: (mutable: Vector<T>) => any): Vector<T>;

    /**
     * @see `Map.prototype.asMutable`
     */
    asMutable(): Vector<T>;

    /**
     * @see `Map.prototype.asImmutable`
     */
    asImmutable(): Vector<T>;
  }


  /**
   * Cursors
   * -------
   *
   * Cursors allow you to hold a reference to a path in a nested immutable data
   * structure, allowing you to pass smaller sections of a larger nested
   * collection to portions of your application while maintaining a central point
   * aware of changes to the entire data structure.
   *
   * This is particularly useful when used in conjuction with component-based UI
   * libraries like [React](http://facebook.github.io/react/) or to simulate
   * "state" throughout an application while maintaining a single flow of logic.
   *
   * Cursors provide a simple API for getting the value at that path
   * (the equivalent of `this.getIn(keyPath)`), updating the value at that path
   * (the equivalent of `this.updateIn(keyPath)`), and getting a sub-cursor
   * starting from that path.
   *
   * When updated, a new root collection is created and provided to the `onChange`
   * function provided to the first call to `map.cursor(...)`.
   *
   * @see Map.cursor
   */

  export interface Cursor<T> extends LazyKeyedSequence<any, any> {

    /**
     * Returns a sub-cursor following the key-path starting from this cursor.
     */
    cursor(subKeyPath: Array<any>): Cursor<any>;
    cursor(subKey: any): Cursor<any>;

    /**
     * Returns the value at the cursor, if the cursor path does not yet exist,
     * returns `notSetValue`.
     */
    deref(notSetValue?: T): T;

    /**
     * Returns the value at the `key` in the cursor, or `notSetValue` if it
     * does not exist.
     *
     * If the key would return a collection, a new Cursor is returned.
     */
    get(key: any, notSetValue?: any): any;

    /**
     * Returns the value at the `keyPath` in the cursor, or `notSetValue` if it
     * does not exist.
     *
     * If the keyPath would return a collection, a new Cursor is returned.
     */
    getIn(keyPath: Array<any>, notSetValue?: any): any;

    /**
     * Sets `value` at `key` in the cursor, returning a new cursor to the same
     * point in the new data.
     */
    set(key: any, value: any): Cursor<T>;

    /**
     * Deletes `key` from the cursor, returning a new cursor to the same
     * point in the new data.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias delete
     */
    remove(key: any): Cursor<T>;
    delete(key: any): Cursor<T>;

    /**
     * Clears the value at this cursor, returning a new cursor to the same
     * point in the new data.
     */
    clear(): Cursor<T>;

    /**
     * Updates the value in the data this cursor points to, triggering the
     * callback for the root cursor and returning a new cursor pointing to the
     * new data.
     */
    update(updater: (value: T) => T): Cursor<T>;
    update(key: any, updater: (value: any) => any): Cursor<T>;
    update(key: any, notSetValue: any, updater: (value: any) => any): Cursor<T>;


    /**
     * Every time you call one of the above functions, a new immutable value is
     * created and the callback is triggered. If you need to apply a series of
     * mutations to a Cursor without triggering the callback repeatedly,
     * `withMutations()` creates a temporary mutable copy of the value which
     * can apply mutations in a highly performant manner. Afterwards the
     * callback is triggered with the final value.
     */
    withMutations(mutator: (mutable: T) => T): Cursor<T>;
  }

  // ES6 Iterator
  export interface Iterator<T> {
    next(): { value: T; done: boolean; }
  }

}
