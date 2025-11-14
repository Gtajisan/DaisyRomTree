# Proprietary Vendor Files for Xiaomi Mi A2 Lite (daisy)

This repository contains proprietary vendor blobs for the Xiaomi Mi A2 Lite (daisy).

## Extracting Proprietary Blobs

To extract proprietary blobs from a device running stock firmware:

1. Connect your device with ADB enabled
2. Run the extract script from the device tree:
   ```bash
   cd device/xiaomi/daisy
   ./extract-files.sh
   ```

The blobs will be extracted to `vendor/xiaomi/daisy/proprietary/`.

## Copyright

```
#
# Copyright (C) 2018-2024 The LineageOS Project
#
# SPDX-License-Identifier: Apache-2.0
#
```
