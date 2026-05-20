const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: {
    unpack: '**/*.node', // décompresse les fichiers natifs (mysql2)
  },
    name: 'salle-de-sport',
    executableName: 'salle-de-sport',
    icon: './assets/icon', // Forge ajoute .ico / .icns / .png automatiquement
    extraResource: [
  './src/fitmanager_structure.sql'
],
  },
  rebuildConfig: {},
  makers: [
   {
  name: '@electron-forge/maker-squirrel',
  config: {
    name: 'salle_de_sport',
    iconUrl: 'https://raw.githubusercontent.com/amina-hue/Salle-De-Sport/main/assets/icon.ico',
    setupIcon: './assets/icon.ico',
    noMsi: true,
  },
},
    {
      name: '@electron-forge/maker-zip',      // macOS .zip
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',      // Linux .deb
      config: {
        options: {
          icon: './assets/icon.png',
          maintainer: 'Amina',
          homepage: 'https://github.com/amina-hue/Salle-De-Sport', 
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',      // Linux .rpm
      config: {
        options: {
          icon: './assets/icon.png',
        },
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'amina-hue',
          name: 'Salle-De-Sport',
        },
        prerelease: false,
        draft: false,
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.jsx',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
                config: './webpack.preload.config.js',
              },
            },
          ],
        },
      },
    },
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
};
