import { normalize, schema } from 'normalizr';
import { murmur2 } from 'murmurhash-js';
import uuid from 'uuid/v1';
import { parseGitHubUrl } from '../../utils/parse-github-url/parse-github-url';

// TODO: Improve this, it oddly enough depends on a trailing slash
// being on v3/ of the api...
const endpoint = (api, owner, repo, path, branch) => {
  const fullPath = path
    ? `repos/${owner}/${repo}/contents/${path}`
    : `repos/${owner}/${repo}/contents`;
  return new URL(`${fullPath}?ref=${branch}`, api);
};

const isDir = content => Array.isArray(content.content);

const fetchContents = async (
  name,
  api,
  accessToken,
  owner,
  repo,
  path,
  branch
) => {
  const response = await window.fetch(
    endpoint(api, owner, repo, path, branch),
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${accessToken}`
      }
    }
  );
  // TODO: Better error handling / messaging
  if (response.status !== 200) {
    throw new Error(`Expected 200, received ${response.status}`);
  }
  const contents = await response.json();
  if (Array.isArray(contents)) {
    return {
      id: uuid(),
      name,
      content: await Promise.all(
        contents.map(content =>
          fetchContents(
            content.name,
            api,
            accessToken,
            owner,
            repo,
            content.path,
            branch
          )
        )
      )
    };
  } else if (contents.type === 'file') {
    return {
      id: uuid(),
      name: contents.name,
      content: contents.content
    };
  }
  throw new Error(`contents type not supported: '${contents.type}'`);
};

const fileSchema = new schema.Entity('files');
const dirSchema = new schema.Entity('dirs');
const contentSchema = new schema.Union(
  {
    files: fileSchema,
    dirs: dirSchema
  },
  input => (Array.isArray(input.content) ? 'dirs' : 'files')
);
dirSchema.define({
  content: [contentSchema]
});
const sourceSchema = new schema.Entity('sources', {
  content: [contentSchema]
});
export const sourceListSchema = new schema.Array(sourceSchema);

const fetchSource = async request => {
  const { api, owner, repo, path, branch } = parseGitHubUrl(request.url);
  const content = await fetchContents(
    // NOTE: We pass in the path as the name however the content is later reparented so is largely irrelevant
    path,
    api,
    request.accessToken,
    owner,
    repo,
    path,
    branch
  );
  const source = {
    ...request,
    // Source extends Dir (if only I had typescript to document this ????) so
    // the source itself is used to represent the top level directory @ `path`
    // which is why we reparent the dir contents to the source.
    content: isDir(content) ? content.content : [content]
  };
  const normalizedSource = normalize([source], sourceListSchema);
  return normalizedSource;
};

export default fetchSource;
