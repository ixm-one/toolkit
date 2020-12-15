import * as library from './index';
import xdg from 'xdg-basedir';
import * as path from 'path';
import { valid } from 'semver';

test.todo('clients should be authenticated under github actions');
test.todo('ninja-build should return a single asset');
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

it('should return the given string', () => {
  const token = library.token('test');
  expect(token).toBe('test');
});

describe('ninja-build', () => {
  it('should return a non-zero list of releases', async () => {
    const releases = await library.releases('ninja-build', 'ninja');
    expect(releases).toBeTruthy();
    expect(releases.length).toBeTruthy();
  });
});

describe('sccache', () => {
  it('should return a non-zero list of releases', async () => {
    const releases = await library.releases('mozilla', 'sccache');
    expect(releases).toBeTruthy();
  });
});

//it('should return a single asset', async () => {
//  const releases = await library.releases('ninja-build', 'ninja');
//  expect(releases).toBeTruthy();
//});

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
