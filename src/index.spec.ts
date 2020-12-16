import * as library from './index';
import xdg from 'xdg-basedir';
import * as path from 'path';
import { valid } from 'semver';
import { token } from './github';

describe.each([
  ['ninja-build', 'ninja'],
  ['mozilla', 'sccache'],
  ['kitware', 'cmake'],
])('toolkit.assets', (user, repo) => {
  it.todo(`${user}/${repo} should return a single asset`);
});

describe.each([
  ['ninja-build', 'ninja'],
  ['mozilla', 'sccache'],
  ['kitware', 'cmake'],
])('toolkit.releases', (user, repo) => {
  it(`${user}/${repo} should return multiple releases`, async () => {
    const releases = await library.releases(user, repo);
    expect(releases).toBeTruthy();
    expect(releases.length).toBeTruthy();
  });
});

test.todo('clients should be authenticated under github actions');

it('should return a path', () => {
  const directory = library.cache('tests');
  expect(directory).toEqual(path.join(xdg.cache ?? __dirname, 'tests'));
});

it('should return the given string', () => {
  const token = library.token('test');
  expect(token).toBe('test');
});
