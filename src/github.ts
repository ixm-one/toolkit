/* TODO: This should all be moved to index.ts */
import * as github from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { validRange } from 'semver';
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
export function token(input?: string) {
  const token = core.getInput(input || 'github-token');
  return token || core.getInput('github-token') || process.env.GITHUB_TOKEN;
}

/**
 * Retrieve an action input for a given tool, such as `hugo-version`, and
 * validate that it is a valid input. By default (and due to its widespread
 * usage), the semver package is used to validate inputs via `validRange`
 * @returns The value for the action input *or* `undefined` if the input could
 * not be validated.
 * @param tool The expected name of the tool to get (e.g., `hugo-version`)
 * @param validator An optional validator to use against the input. By default,
 * this will use the semver `valid` function
 */
export function version(tool: string, validator?: (input: string) => boolean) {
  validator ??= (input: string): boolean => {
    return !!validRange(input);
  };
  const input = core.getInput(`${tool}-version`);
  if (validator(input)) {
    return input;
  }
  return undefined;
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
