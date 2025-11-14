import { Octokit } from '@octokit/rest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getAllFiles(dir: string, basePath: string = ''): Promise<Array<{path: string, content: string}>> {
  const files: Array<{path: string, content: string}> = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    const relativePath = basePath ? `${basePath}/${item}` : item;

    if (stat.isDirectory()) {
      files.push(...await getAllFiles(fullPath, relativePath));
    } else {
      const content = readFileSync(fullPath, 'utf-8');
      files.push({ path: relativePath, content });
    }
  }

  return files;
}

async function uploadFilesToRepo(octokit: Octokit, owner: string, repo: string, files: Array<{path: string, content: string}>) {
  console.log(`\nUploading to ${repo}...`);
  
  // Get default branch
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  const branch = repoData.default_branch;
  
  console.log(`  Using branch: ${branch}`);
  
  for (const file of files) {
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: file.path,
        message: `Add ${file.path} for LineageOS 23.0`,
        content: Buffer.from(file.content).toString('base64'),
        branch,
      });
      console.log(`  ✓ ${file.path}`);
    } catch (error: any) {
      if (error.status === 422) {
        // File exists, try to update
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: branch,
          });
          
          if ('sha' in data) {
            await octokit.repos.createOrUpdateFileContents({
              owner,
              repo,
              path: file.path,
              message: `Update ${file.path} for LineageOS 23.0`,
              content: Buffer.from(file.content).toString('base64'),
              branch,
              sha: data.sha,
            });
            console.log(`  ✓ ${file.path} (updated)`);
          }
        } catch (updateError: any) {
          console.error(`  ✗ Failed to update ${file.path}: ${updateError.message}`);
        }
      } else {
        console.error(`  ✗ Failed to upload ${file.path}: ${error.message}`);
      }
    }
    // Delay to avoid rate limit
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  const owner = 'Gtajisan';

  const repos = [
    {
      name: 'android_device_xiaomi_daisy',
      localPath: 'device-trees/android_device_xiaomi_daisy',
    },
    {
      name: 'android_device_xiaomi_msm8953-common',
      localPath: 'device-trees/android_device_xiaomi_msm8953-common',
    },
  ];

  console.log('=== Uploading Device Tree Files to GitHub ===\n');

  for (const repoInfo of repos) {
    try {
      const files = await getAllFiles(repoInfo.localPath);
      await uploadFilesToRepo(octokit, owner, repoInfo.name, files);
      console.log(`✓ Completed ${repoInfo.name}\n`);
    } catch (error: any) {
      console.error(`✗ Error with ${repoInfo.name}: ${error.message}\n`);
    }
  }

  console.log('\n=== Upload Complete ===');
}

main().catch(console.error);
