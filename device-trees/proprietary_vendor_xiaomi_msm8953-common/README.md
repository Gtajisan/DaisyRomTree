# Proprietary Vendor Files for Xiaomi MSM8953 Devices

This repository contains common proprietary vendor blobs for Xiaomi devices based on the Qualcomm MSM8953 platform.

## Supported Devices

- Xiaomi Mi A2 Lite (daisy)
- Xiaomi Mi A1 (tissot)

## Extracting Proprietary Blobs

To extract proprietary blobs from a device running stock firmware:

1. Connect your device with ADB enabled
2. Run the extract script from the common device tree:
   ```bash
   cd device/xiaomi/msm8953-common
   ./extract-files.sh
   ```

The blobs will be extracted to `vendor/xiaomi/msm8953-common/proprietary/`.

## Copyright

```
#
# Copyright (C) 2017-2024 The LineageOS Project
#
# SPDX-License-Identifier: Apache-2.0
#
```
