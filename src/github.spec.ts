import type { Release } from './github';
import * as github from './github';

describe('github.client', () => {
  const environment = process.env;
  beforeAll(() => {
    process.env = { ...environment };
    delete process.env['INPUT_GITHUB-TOKEN'];
    delete process.env['GITHUB_TOKEN'];
  });
  afterAll(() => {
    process.env = environment;
  });

  it('should throw an error when there is no token or options.auth', () => {
    expect(() => github.client()).toThrow();
  });
  it('should throw an error when there is both a token and options.auth', () => {
    expect(() => github.client('foo', { auth: 'unauthenticated' })).toThrow();
  });
  it('should return a valid client when GITHUB_TOKEN exists', () => {
    process.env = environment;
    expect(github.client()).toBeDefined();
  });
});

describe.each([
  ['ninja-build', 'ninja'],
  ['mozilla', 'sccache'],
  ['kitware', 'cmake'],
])('github.releases', (owner, repo) => {
  it(`github.releases('${owner}', '${repo}') should return multiple releases`, async () => {
    expect(github.releases(owner, repo)).resolves.not.toEqual([]);
  });
  it(`github.releases('${owner}', '${repo}', { prereleases: true }) should return multiple releases`, async () => {
    const prereleases = github.releases(owner, repo, { prereleases: true });
    const releases = github.releases(owner, repo);
    expect(prereleases).resolves.not.toEqual([]);
    expect(releases).resolves.not.toEqual([]);
    const array = expect.arrayContaining(await releases);
    expect(prereleases).resolves.toEqual(array);
  });
});
describe.each([
  ['ninja-build', 'ninja'],
  ['mozilla', 'sccache'],
  ['kitware', 'cmake'],
])('github.select', (owner, repo) => {
  /* This is the current *default* implementation of github.select, but is here for testing purposes */
  it(`github.select(github.releases('${owner}', '${repo}')) should return a single release`, async () => {
    const release = github
      .releases(owner, repo)
      .then((releases: Release[]) => github.select(releases, repo));
    expect(release).resolves.toBeDefined();
    expect(release).resolves.toHaveProperty('assets');
  });
  it(`github.select([], '${repo}') should return undefined`, () => {
    expect(github.select([], repo)).toBeUndefined();
  });
});
