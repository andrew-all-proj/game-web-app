module.exports = {
  locales: ['en', 'ru'],
  defaultNamespace: 'common',
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  output: 'public/locales/$LOCALE/$NAMESPACE.json',

  keepRemoved: true,        
  sort: true,             
  indentation: 2,          
  lineEnding: 'auto',
  resetDefaultValueLocale: 'en',
  defaultValue: (lng, ns, key) => {
    if (lng === 'en') return key;
    return '';
  },

  createOldCatalogs: true,
  oldCatalogsDir: 'locales/_history',

  lexers: {
    js:  ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    ts:  ['JavascriptLexer'],
    tsx: ['JsxLexer'],
    default: ['JavascriptLexer'],
  },

  functions: ['t', 'i18n.t'],
};
