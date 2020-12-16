import * as library from './index';
import xdg from 'xdg-basedir';
import * as path from 'path';
import { valid } from 'semver';
import { token } from './github';

describe('assets', () => {
  it.todo('ninja-build should return a single asset');
  it.todo('sccache should return a single asset');
  it.todo('cmake should return a single asset');
});

describe.each([
  ['mozilla', 'sccache'],
  ['ninja-build', 'ninja'],
  ['kitware', 'cmake'],
])('toolkit.releases', (user, repo) => {
  it(`${user}/${repo} should return multiple releases`, async () => {
    const releases = await library.releases(user, repo);
    expect(releases).toBeTruthy();
    expect(releases.length).toBeTruthy();
  });
});

test.todo('clients should be authenticated under github actions');
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
