import * as library from './index';

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
