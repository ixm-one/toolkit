import * as github from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';

type OctokitOptions = Parameters<typeof github.getOctokit>[1];
type GitHub = ReturnType<typeof github.getOctokit>;

function isGitHubActions(): boolean {
  return process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
}

export function token(input?: string): string | undefined {
  const token = core.getInput(input || 'github-token');
  return token || core.getInput('github-token') || process.env.GITHUB_TOKEN;
}

export function client(authToken?: string, options?: OctokitOptions): GitHub {
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
    console.warn('Not running under GitHub Actions.');
    console.warn('Unauthenticated instance returned.');
    return new GitHub();
  }
}
