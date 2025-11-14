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

async function createBranch(octokit: Octokit, owner: string, repo: string, branchName: string) {
  try {
    // Get the default branch ref
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/main`,
    });
    
    // Create new branch from main
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });
    
    console.log(`  ✓ Created branch ${branchName}`);
  } catch (error: any) {
    if (error.status === 422) {
      console.log(`  ✓ Branch ${branchName} already exists`);
    } else if (error.status === 404) {
      // Try master instead of main
      try {
        const { data: refData } = await octokit.git.getRef({
          owner,
          repo,
          ref: `heads/master`,
        });
        
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: refData.object.sha,
        });
        
        console.log(`  ✓ Created branch ${branchName} from master`);
      } catch (masterError) {
        console.error(`  ✗ Failed to create branch ${branchName}: ${error.message}`);
      }
    } else {
      console.error(`  ✗ Failed to create branch ${branchName}: ${error.message}`);
    }
  }
}

async function uploadFilesToRepo(octokit: Octokit, owner: string, repo: string, files: Array<{path: string, content: string}>, branch: string) {
  console.log(`\nUploading to ${repo} (branch: ${branch})...`);
  
  // Create branch first
  await createBranch(octokit, owner, repo, branch);
  
  for (const file of files) {
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: file.path,
        message: `Add ${file.path}`,
        content: Buffer.from(file.content).toString('base64'),
        branch,
      });
      console.log(`  ✓ ${file.path}`);
    } catch (error: any) {
      if (error.status === 422) {
        // File might already exist, try to update
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
              message: `Update ${file.path}`,
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
    // Add small delay to avoid rate limiting
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
      branch: '16',
    },
    {
      name: 'android_device_xiaomi_msm8953-common',
      localPath: 'device-trees/android_device_xiaomi_msm8953-common',
      branch: '16',
    },
    {
      name: 'proprietary_vendor_xiaomi_daisy',
      localPath: 'device-trees/proprietary_vendor_xiaomi_daisy',
      branch: '16',
    },
    {
      name: 'proprietary_vendor_xiaomi_msm8953-common',
      localPath: 'device-trees/proprietary_vendor_xiaomi_msm8953-common',
      branch: '16',
    },
  ];

  console.log('=== Uploading Device Tree Files to GitHub ===\n');

  for (const repoInfo of repos) {
    try {
      // Get all files from local directory
      const files = await getAllFiles(repoInfo.localPath);
      
      // Upload files to GitHub
      await uploadFilesToRepo(octokit, owner, repoInfo.name, files, repoInfo.branch);
      
      console.log(`✓ Completed ${repoInfo.name}\n`);
    } catch (error: any) {
      console.error(`✗ Error with ${repoInfo.name}: ${error.message}\n`);
    }
  }

  console.log('\n=== Upload Complete ===');
  console.log(`\nAll device trees are now available at: https://github.com/${owner}`);
  console.log('\nRepositories:');
  repos.forEach(repo => {
    console.log(`  - https://github.com/${owner}/${repo.name}/tree/${repo.branch}`);
  });
}

main().catch(console.error);
