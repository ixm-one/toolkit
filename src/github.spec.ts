import * as github from './github';

describe('github.client', () => {
  const CI = process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
  const environment = process.env;
  const it = CI ? test : test.skip;
  beforeAll(() => {
    process.env = { ...environment };
    delete process.env['INPUT_GITHUB-TOKEN'];
    delete process.env['GITHUB_TOKEN'];
  });
  afterAll(() => {
    process.env = environment;
  });

  it('should throw an error when there is no token or options.auth', () => {
    expect(() => {
      github.client();
    }).toThrow();
  });
  it('should throw an error when there is both a token and options.auth', () => {
    expect(() => {
      github.client('foo', { auth: 'unauthenticated' });
    }).toThrow();
  });
});
