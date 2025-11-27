import { cp, mkdir } from 'node:fs/promises'
import path from 'node:path'

import { FuseV1Options, FuseVersion } from '@electron/fuses'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig } from '@electron-forge/shared-types'

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpack: '*.{node,dylib}',
      unpackDir: '{better-sqlite3}',
    },
  },

  rebuildConfig: {
    onlyModules: ['better-sqlite3'],
    force: true,
  },

  hooks: {
    async packageAfterCopy(_forgeConfig, buildPath) {
      const requiredNativePackages = [
        'better-sqlite3',
        'bindings',
        'file-uri-to-path',
      ]

      const sourceNodeModulesPath = path.resolve(__dirname, 'node_modules')
      const destNodeModulesPath = path.resolve(buildPath, 'node_modules')

      await Promise.all(
        requiredNativePackages.map(async (packageName) => {
          const sourcePath = path.join(sourceNodeModulesPath, packageName)
          const destPath = path.join(destNodeModulesPath, packageName)

          await mkdir(path.dirname(destPath), { recursive: true })
          await cp(sourcePath, destPath, {
            recursive: true,
            preserveTimestamps: true,
          })
        }),
      )
    },
  },

  makers: [
    // Windows - Squirrel Installer
    new MakerSquirrel({
      name: 'ElectronBasic',
      authors: 'Gayuh Ridho',
      description: 'Electron Basic Application',
    }),

    // Windows - Portable ZIP
    new MakerZIP({}, ['win32']),

    // macOS - DMG Installer (Tambahan dari config lama Anda)
    new MakerDMG({
      format: 'ULFO',
      name: 'ElectronBasic',
    }),

    // macOS - ZIP (untuk auto-update)
    new MakerZIP({}, ['darwin']),

    // Linux - Debian/Ubuntu
    new MakerDeb({
      options: {
        maintainer: 'Gayuh Ridho <gayuhridho369@gmail.com>',
        homepage: 'https://github.com/gayuhridho369/electron-basic',
        categories: ['Utility', 'Development'],
        section: 'utils',
      },
    }),

    // Linux - Fedora/RHEL
    new MakerRpm({
      options: {
        homepage: 'https://github.com/gayuhridho369/electron-basic',
        categories: ['Utility', 'Development'],
      },
    }),
  ],

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'gayuhridho369',
          name: 'electron-basic',
        },
        prerelease: false, // Changed from true - set true jika mau pre-release
        draft: true, // Release sebagai draft dulu, bisa edit sebelum publish
        generateReleaseNotes: true, // Auto generate dari commits
      },
    },
  ],

  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.mts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.mts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),

    new AutoUnpackNativesPlugin({}),

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config
