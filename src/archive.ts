import * as tc from '@actions/tool-cache';
import * as path from 'path';

type Compression = 'zip' | 'pkg' | 'gzip' | '7zip';

function select(type: Compression) {
  switch (type) {
    case 'gzip':
      return tc.extractTar;
    case '7zip':
      return tc.extract7z;
    case 'pkg':
      return tc.extractXar;
    case 'zip':
      return tc.extractZip;
  }
}

function detect(filename: string): Compression {
  const extension = path.extname(filename);
  if (['.gz', '.tgz', '.bz2'].includes(extension)) {
    return 'gzip';
  } else if (extension === '.zip') {
    return 'zip';
  } else if (extension === '.7z') {
    return '7zip';
  } else if (extension === '.pkg' && process.platform === 'darwin') {
    return 'pkg';
  } else {
    throw new Error('could not detect filetype.');
  }
}

export default async function extract(
  location: string,
  destination: string,
  type: Compression = detect(location)
): Promise<string> {
  const extractor = select(type);
  const artifact = await tc.downloadTool(location);
  return await extractor(artifact, destination);
}
