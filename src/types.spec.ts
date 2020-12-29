import * as library from './types';

describe('seeker', () => {
  it('should create a function from a string', () => {
    const seek = library.seeker<library.Asset>('v1.0.0');
    expect(seek.length).toBe(1);
    expect(seek.name).toBe('');
  });
  it('should create a function from a RegExp', () => {
    const seek = library.seeker<library.Asset>(/v1[.]0[.]0/);
    expect(seek.length).toBe(1);
    expect(seek.name).toBe('');
  });
  it('should return the same function given', () => {
    const fn = (items: library.Asset[]) => {
      return items.find((item) => item.label.match(/v1[.]0[.]0/));
    };
    const seek = library.seeker<library.Asset>(fn);
    expect(seek).toBe(fn);
  });
});
