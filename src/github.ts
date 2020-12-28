/* TODO: This should all be moved to index.ts */
import * as github from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import type { OctokitOptions } from './types';

/** @internal */
function isGitHubActions(): boolean {
  return process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
}

/**
 * @returns The value of the (optional) input requested by the user, the
 * string representing the input `github-token` or the value of the
 * `$GITHUB_TOKEN` environment variable.
 * @param input An optional action input to lookup instead of `github-token`
 * @category GitHub
 */
export function token(input?: string): string | undefined {
  const token = core.getInput(input || 'github-token');
  return token || core.getInput('github-token') || process.env.GITHUB_TOKEN;
}

/**
 * @returns A [[GitHub]] object with better defaults. If not running under
 * GitHub Actions, this function returns an unauthenticated client. This is
 * intended for local testing until a proper 'mock' object can be created for
 * unit tests only when running locally.
 * @param authToken If this is not set, and `options?.auth` is not set, this
 * will attempt to fallback to a `github-token` input or a `$GITHUB_TOKEN`
 * environment variable. When *not* running under GitHub actions, this fallback
 * is ignored and an unauthenticated client might result instead.
 * @param options These are passed through nearly untouched to the underlying
 * [[GitHub]] client.
 * @category GitHub
 */
export function client(authToken?: string, options?: OctokitOptions) {
  if (isGitHubActions()) {
    if (!options?.auth) {
      authToken ||= token();
    }
    if (!authToken && !options?.auth) {
      throw new Error(`'authToken' or 'options.auth' is required`);
    }
    if (authToken && options?.auth) {
      throw new Error(`Cannot set both 'token' or 'options.auth'`);
    }
    return github.getOctokit(authToken ?? '', options);
  } else {
    /* TODO: This will be removed once we know we are reliably stable for the
     * API
     */
    console.warn('Not running under GitHub Actions.');
    console.warn('Unauthenticated instance returned.');
    return new GitHub();
  }
}
