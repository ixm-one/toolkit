import * as library from './github';

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
      library.client();
    }).toThrow();
  });
  it('should throw an error when there is both a token and options.auth', () => {
    expect(() => {
      library.client('foo', { auth: 'unauthenticated' });
    }).toThrow();
  });
});

describe('github.token(user-defined-value)', () => {
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
    expect(library.token('')).toBeUndefined();
    expect(library.token()).toBeUndefined();
  });
  it('should return a valid input', () => {
    process.env['INPUT_TEST'] = 'test';
    expect(library.token('test')).toBeDefined();
    expect(library.token('test')).toBe('test');
  });
});

describe('github.token(process.env.GITHUB_TOKEN)', () => {
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
    expect(library.token()).toBe('test');
  });
  it('should return the GITHUB_TOKEN despite user input', () => {
    process.env.GITHUB_TOKEN = 'test';
    expect(library.token('test2')).toBe('test');
  });
});

describe('github.token(`core.getInput(github-token)`)', () => {
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
    expect(library.token()).toBe('test');
  });
  it('should return core.getInput("github-token") despite user input', () => {
    process.env['INPUT_GITHUB-TOKEN'] = 'test';
    expect(library.token('test2')).toBe('test');
  });
});

describe('github.version', () => {
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
    expect(library.version('hugo')).toBe('0.79');
  });
  it('should return an invalid semver range', () => {
    process.env['INPUT_HUGO-VERSION'] = '^1^';
    expect(library.version('hugo')).toBe(undefined);
  });
  it('should return any value', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validator = (_: string) => {
      return true;
    };
    process.env['INPUT_HUGO-VERSION'] = '';
    expect(library.version('hugo', validator)).toBe('');
    process.env['INPUT_HUGO-VERSION'] = 'just-words';
    expect(library.version('hugo', validator)).toBe('just-words');
  });
});
