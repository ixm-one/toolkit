import { getToken, getToolVersion } from './input';

describe('input.getToken(user-defined-value)', () => {
  const environment = process.env;
  beforeAll(() => {
    process.env = { ...environment };
    delete process.env['INPUT_GITHUB-TOKEN'];
    delete process.env['GITHUB_TOKEN'];
  });
  afterAll(() => {
    process.env = environment;
  });
  it('should never be an empty string', () => {
    expect(getToken('')).toBeUndefined();
    expect(getToken()).toBeUndefined();
  });
  it('should return a valid input', () => {
    process.env['INPUT_TEST'] = 'test';
    expect(getToken('test')).toBeDefined();
    expect(getToken('test')).toBe('test');
  });
});

describe('input.getToken(process.env.GITHUB_TOKEN)', () => {
  const environment = process.env;
  beforeAll(() => {
    process.env = { ...environment };
    delete process.env['INPUT_GITHUB-TOKEN'];
    delete process.env['GITHUB_TOKEN'];
  });
  afterAll(() => {
    process.env = environment;
  });
  it('should return the GITHUB_TOKEN environment variable', () => {
    process.env.GITHUB_TOKEN = 'test';
    expect(getToken()).toBe('test');
  });
  it('should return the GITHUB_TOKEN despite user input', () => {
    process.env.GITHUB_TOKEN = 'test';
    expect(getToken('test2')).toBe('test');
  });
});

describe('input.getToken(`core.getInput(github-token)`)', () => {
  const environment = process.env;
  beforeAll(() => {
    process.env = { ...environment };
    delete process.env['INPUT_GITHUB-TOKEN'];
    delete process.env['GITHUB_TOKEN'];
  });
  afterAll(() => {
    process.env = environment;
  });
  it('should return core.getInput("github-token")', () => {
    process.env['INPUT_GITHUB-TOKEN'] = 'test';
    expect(getToken()).toBe('test');
  });
  it('should return core.getInput("github-token") despite user input', () => {
    process.env['INPUT_GITHUB-TOKEN'] = 'test';
    expect(getToken('test2')).toBe('test');
  });
});

describe('github.getToolVersion', () => {
  const environment = process.env;
  beforeAll(() => {
    process.env = { ...environment };
    delete process.env['INPUT_HUGO-VERSION'];
  });
  afterAll(() => {
    process.env = environment;
  });
  it('should return core.getInput("hugo-version")', () => {
    process.env['INPUT_HUGO-VERSION'] = '0.79';
    expect(getToolVersion('hugo')).toBe('0.79');
  });
  it('should return an invalid semver range', () => {
    process.env['INPUT_HUGO-VERSION'] = '^1^';
    expect(getToolVersion('hugo')).toBe(undefined);
  });
  it('should return any value', () => {
    const validator = () => true;
    process.env['INPUT_HUGO-VERSION'] = '';
    expect(getToolVersion('hugo', validator)).toBe('');
    process.env['INPUT_HUGO-VERSION'] = 'just-words';
    expect(getToolVersion('hugo', validator)).toBe('just-words');
  });
});
