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
])('github.releases)', (owner, repo) => {
  it(`github.releases(${owner}, ${repo}) should return multiple releases`, async () => {
    const releases = github.releases(owner, repo);
    expect(releases).resolves.toBeTruthy();
    expect((await releases).length).toBeTruthy();
  });
  it(`github.releases(${owner}, ${repo}, { prereleases: true }) should return multiple releases`, async () => {
    const prereleases = github.releases(owner, repo, { prereleases: true });
    const releases = github.releases(owner, repo);
    expect(prereleases).resolves.toBeTruthy();
    expect(releases).resolves.toBeTruthy();
    const array = expect.arrayContaining(await releases);
    expect(prereleases).resolves.toEqual(array);
  });
});
