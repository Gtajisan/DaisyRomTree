import { Octokit } from '@octokit/rest';

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

async function createDeviceTreeRepos() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  const owner = 'Gtajisan';

  // Define repositories to create based on your daisy device
  const repos = [
    {
      name: 'android_device_xiaomi_daisy',
      description: 'Device tree for Xiaomi Mi A2 Lite (daisy) - LineageOS 23.0',
      path: 'device/xiaomi/daisy',
      branch: '16',
    },
    {
      name: 'android_device_xiaomi_msm8953-common',
      description: 'Common device tree for Xiaomi MSM8953 devices - LineageOS 23.0',
      path: 'device/xiaomi/msm8953-common',
      branch: '16',
    },
    {
      name: 'proprietary_vendor_xiaomi_msm8953-common',
      description: 'Proprietary vendor blobs for Xiaomi MSM8953 common',
      path: 'vendor/xiaomi/msm8953-common',
      branch: '16',
    },
    {
      name: 'proprietary_vendor_xiaomi_daisy',
      description: 'Proprietary vendor blobs for Xiaomi daisy',
      path: 'vendor/xiaomi/daisy',
      branch: '16',
    },
    {
      name: 'android_kernel_xiaomi_msm8953',
      description: 'Kernel source for Xiaomi MSM8953 devices - LineageOS 23.0',
      path: 'kernel/xiaomi/msm8953',
      branch: 'lineage-23.0-bpf-test',
    },
  ];

  console.log('Creating device tree repositories for LineageOS 23.0...\n');

  for (const repo of repos) {
    try {
      // Check if repo exists
      try {
        const existing = await octokit.repos.get({ owner, repo: repo.name });
        console.log(`✓ Repository ${repo.name} already exists: ${existing.data.html_url}`);
        continue;
      } catch (error: any) {
        if (error.status !== 404) throw error;
      }

      // Create repository
      const created = await octokit.repos.createForAuthenticatedUser({
        name: repo.name,
        description: repo.description,
        private: false,
        auto_init: true,
        license_template: 'apache-2.0',
      });

      console.log(`✓ Created: ${created.data.html_url}`);
      console.log(`  Branch: ${repo.branch}`);
      console.log(`  Path: ${repo.path}\n`);

      // Create README with build instructions
      const readmeContent = `# ${repo.name}

${repo.description}

## Build Instructions

This device tree is for building LineageOS 23.0 for the Xiaomi Mi A2 Lite (daisy).

### Sync the source:

\`\`\`bash
repo init -u https://github.com/LineageOS/android.git -b lineage-23.0 --git-lfs
repo sync -c -j$(nproc --all) --force-sync --no-clone-bundle --no-tags
\`\`\`

### Clone device trees:

\`\`\`bash
git clone --depth=1 --branch ${repo.branch} https://github.com/${owner}/${repo.name} ${repo.path}
\`\`\`

### Build:

\`\`\`bash
source build/envsetup.sh
lunch lineage_daisy-ap2a-userdebug
mka bacon
\`\`\`

## Credits

- LineageOS Team
- Device maintainers
`;

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repo.name,
        path: 'README.md',
        message: 'Add README with build instructions',
        content: Buffer.from(readmeContent).toString('base64'),
      });

    } catch (error: any) {
      console.error(`✗ Error with ${repo.name}: ${error.message}\n`);
    }
  }

  // Generate the build script
  const buildScript = `# manifest is from https://github.com/NeedAlt-Room

git clone --depth=1 --branch 16 https://github.com/${owner}/android_device_xiaomi_daisy device/xiaomi/daisy
git clone --depth=1 --branch 16 https://github.com/${owner}/android_device_xiaomi_msm8953-common device/xiaomi/msm8953-common
git clone --depth=1 --branch 16 https://github.com/${owner}/proprietary_vendor_xiaomi_msm8953-common vendor/xiaomi/msm8953-common
git clone --depth=1 --branch 16 https://github.com/${owner}/proprietary_vendor_xiaomi_daisy vendor/xiaomi/daisy
git clone --depth=1 --branch lineage-23.0 https://github.com/LineageOS/android_hardware_xiaomi hardware/xiaomi
git clone --depth=1 --branch lineage-22.2 https://github.com/LineageOS/android_hardware_sony_timekeep hardware/sony/timekeep

# NOTE:
# kernel tree
# git clone --depth=1 --branch lineage-23.0-bpf-test https://github.com/${owner}/android_kernel_xiaomi_msm8953/ kernel/xiaomi/msm8953

# for the kernel use something like zyc clang 22, so yes external clang
# https://github.com/ZyCromerZ/Clang/releases
# extract and then add its path to TARGET_KERNEL_CLANG_PATH on device/xiaomi/msm8953-common/BoardConfigCommon.mk

# -- add these too and remove /external on build/soong/ui/build/androidmk_denylist.go
git clone --depth=1 https://github.com/LineageOS/android_external_ant-wireless_ant_client.git external/ant-wireless/ant_client
git clone --depth=1 https://github.com/LineageOS/android_external_ant-wireless_ant_native.git external/ant-wireless/ant_native
git clone --depth=1 https://github.com/LineageOS/android_external_ant-wireless_ant_service.git external/ant-wireless/ant_service

# apply this fix on external/ant-wireless/ant_service
# https://github.com/LineageOS/android_external_ant-wireless_ant_service/commit/808676c8bf84dddec22c76fdff880e6e394c366e

# for recovery, add bypasses
# apply on bootable/recovery
# https://github.com/${owner}/android_bootable_recovery/commit/74a50ca6db16ac4c6b7353e9d50f035e19891ff8
`;

  console.log('\n=== Build Script ===\n');
  console.log(buildScript);
  console.log('\n=== Repositories Created Successfully ===');
  console.log(`\nAll repositories are now available at: https://github.com/${owner}`);
  console.log('\nYou can use the build script above to clone all device trees for LineageOS 23.0 builds.');
}

createDeviceTreeRepos().catch(console.error);
