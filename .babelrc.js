const { MODULE_TYPE = 'cjs' } = process.env;

const presets = [
  [
    "@babel/preset-env",
    {
      useBuiltIns: "entry",
      ...( MODULE_TYPE === 'module' ? { modules: false } : {} ),
    }
  ],
];

const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-syntax-object-rest-spread',
];

module.exports = {
  presets,
  plugins,
};
