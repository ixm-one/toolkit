//import * as library from './index';

describe.each([
  ['ninja-build', 'ninja'],
  ['mozilla', 'sccache'],
  ['kitware', 'cmake'],
])('toolkit.assets', (user, repo) => {
  it.todo(`${user}/${repo} should return a single asset`);
});

test.todo('clients should be authenticated under github actions');
