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
});

//test('github.client(...) should be authenticated under github actions', () => {
//  const actions =
//    process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
//  const token = library.token();
//  const client = library.client(token ?? '');
//});

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
