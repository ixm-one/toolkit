import * as core from '@actions/core';
import type { Asset } from './types';
import * as common from './common';

describe('toSeeker', () => {
  it('should create a function from a string', () => {
    const seek = common.toSeeker<Asset>('v1.0.0');
    expect(seek.length).toBe(1);
    expect(seek.name).toBe('');
  });
  it('should create a function from a RegExp', () => {
    const seek = common.toSeeker<Asset>(/v1[.]0[.]0/);
    expect(seek.length).toBe(1);
    expect(seek.name).toBe('');
  });
  it('should return the same function given', () => {
    const fn = (items: Asset[]) => {
      return items.find((item) => item.label.match(/v1[.]0[.]0/));
    };
    const seek = common.toSeeker<Asset>(fn);
    expect(seek).toBe(fn);
  });
});

describe('common log wrappers', () => {
  it('should print debug output', () => {
    const module = common.isGitHubActions() ? core : console;
    const spy = jest.spyOn(module, 'debug');
    common.debug('hello, world');
    expect(spy).toHaveBeenCalledWith('hello, world');
  });

  it('should print warning messages', () => {
    const spy = common.isGitHubActions()
      ? jest.spyOn(core, 'warning')
      : jest.spyOn(console, 'warn');
    common.warn('WARNING!');
    expect(spy).toHaveBeenCalledWith('WARNING!');
  });

  it('should print an error', () => {
    const module = common.isGitHubActions() ? core : console;
    const spy = jest.spyOn(module, 'error');
    common.error('An error has occurred');
    expect(spy).toHaveBeenCalledWith('An error has occurred');
  });
});
