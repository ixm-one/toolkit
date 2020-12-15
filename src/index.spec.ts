import * as library from './index';
import xdg from 'xdg-basedir';
import * as path from 'path';

it('should return a path', () => {
  const directory = library.cache('tests');
  expect(directory).toEqual(path.join(xdg.cache ?? __dirname, 'tests'));
});

it('should return an empty string', () => {
  expect(library.token(undefined)).toBe('');
});

it('should return the given string', () => {
  const token = library.token('test');
  expect(token).toBe('test');
});

it('should return a non-zero list', () => {
  expect(library.releases('ninja-build', 'ninja')).resolves.toBeTruthy();
});
