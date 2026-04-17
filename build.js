#!/usr/bin/env node
/**
 * GAS テンプレートをスタンドアロン HTML に結合するビルドスクリプト
 * Index.html の <?!= include('Styles'); ?> / <?!= include('Scripts'); ?> を展開する
 */
const fs   = require('fs');
const path = require('path');

const dir  = __dirname;
const out  = path.join(dir, 'build', 'index.html');

fs.mkdirSync(path.join(dir, 'build'), { recursive: true });

let html = fs.readFileSync(path.join(dir, 'Index.html'), 'utf8');

// Replace GAS include tags
html = html.replace(/\<\?!=?\s*include\('(\w+)'\);\s*\?>/g, (_, name) => {
  const file = path.join(dir, `${name}.html`);
  if (!fs.existsSync(file)) {
    console.warn(`  ⚠️  ${name}.html not found, skipping`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
});

fs.writeFileSync(out, html, 'utf8');
console.log(`✅ Built → build/index.html`);
