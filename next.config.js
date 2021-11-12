const withTM = require('next-transpile-modules')([
  '@adobe/react-spectrum',
  '@react-spectrum/actiongroup',
  '@react-spectrum/breadcrumbs',
  '@react-spectrum/button',
  '@react-spectrum/buttongroup',
  '@react-spectrum/checkbox',
  '@react-spectrum/combobox',
  '@react-spectrum/dialog',
  '@react-spectrum/divider',
  '@react-spectrum/form',
  '@react-spectrum/icon',
  '@react-spectrum/illustratedmessage',
  '@react-spectrum/image',
  '@react-spectrum/label',
  '@react-spectrum/layout',
  '@react-spectrum/link',
  '@react-spectrum/listbox',
  '@react-spectrum/menu',
  '@react-spectrum/meter',
  '@react-spectrum/numberfield',
  '@react-spectrum/overlays',
  '@react-spectrum/picker',
  '@react-spectrum/progress',
  '@react-spectrum/provider',
  '@react-spectrum/radio',
  '@react-spectrum/slider',
  '@react-spectrum/searchfield',
  '@react-spectrum/statuslight',
  '@react-spectrum/switch',
  '@react-spectrum/tabs',
  '@react-spectrum/table',
  '@react-spectrum/text',
  '@react-spectrum/textfield',
  '@react-spectrum/theme-dark',
  '@react-spectrum/theme-default',
  '@react-spectrum/theme-light',
  '@react-spectrum/tooltip',
  '@react-spectrum/view',
  '@react-spectrum/well',
  '@spectrum-icons/ui',
  '@spectrum-icons/workflow'
]);

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias
    };
    return config;
  },
});
