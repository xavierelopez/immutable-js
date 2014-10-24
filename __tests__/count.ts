///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');

describe('count', () => {

  it('counts sequences with known lengths', () => {
    expect(I.LazySequence.of(1,2,3,4,5).size).toBe(5);
    expect(I.LazySequence.of(1,2,3,4,5).count()).toBe(5);
  })

  it('counts sequences with unknown lengths, resulting in a cached size', () => {
    var seq = I.LazySequence.of(1,2,3,4,5,6).filter(x => x % 2 === 0);
    expect(seq.size).toBe(undefined);
    expect(seq.count()).toBe(3);
    expect(seq.size).toBe(3);
  })

  it('counts sequences with a specific predicate', () => {
    var seq = I.LazySequence.of(1,2,3,4,5,6);
    expect(seq.size).toBe(6);
    expect(seq.count(x => x > 3)).toBe(3);
  })

  it('counts by keyed sequence', () => {
    var grouped = I.LazySequence({a:1,b:2,c:3,d:4}).countBy(x => x % 2);
    expect(grouped.toJS()).toEqual({1:2, 0:2});
    expect(grouped.get(1)).toEqual(2);
  })

  it('counts by indexed sequence', () => {
    expect(
      I.LazySequence.of(1,2,3,4,5,6).countBy(x => x % 2).toJS()
    ).toEqual(
      {1:3, 0:3}
    );
  })

  it('counts by specific keys', () => {
    expect(
      I.LazySequence.of(1,2,3,4,5,6).countBy(x => x % 2 ? 'odd' : 'even').toJS()
    ).toEqual(
      {odd:3, even:3}
    );
  })

})
