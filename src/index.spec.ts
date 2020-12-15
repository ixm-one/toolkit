import * as library from './index';
import xdg from 'xdg-basedir';
import * as path from 'path';
import { valid } from 'semver';

test.todo('clients should be authenticated under github actions');
test.todo('ninja-build should return a single asset', () => {
  return false;
});
test.todo('sccache should return multiple releases');
test.todo('sccache should return a single asset');
test.todo('cmake should return multiple releases');
test.todo('cmake should return a single asset');
test.todo('the correct extraction function should be selected');
it('should be valid', () => {
  expect(valid('3.19.1-rc1')).toBeTruthy();
});

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

it('should return a single asset', () => {
  expect(library.releases('ninja-build', 'ninja')).resolves.toHaveLength(1);
});

//it('should download a zip file', () => {
//  const suffix = ((): string => {
//    switch (process.platform) {
//      case 'darwin':
//        return 'mac';
//      case 'win32':
//        return 'win';
//      default:
//        return process.platform;
//    }
//  })();
//  const releases = library.releases('ninja-build', 'ninja', {
//  assetMatcher: (asset) => {
//    const regex = new RegExp(`.*${suffix()}.*`)
//    asset.name.match(regex)
//  }
//  });
//});
