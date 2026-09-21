const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let failures = 0;

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
scripts.forEach((match, index) => {
  try {
    new vm.Script(match[1], { filename: `inline-script-${index + 1}` });
  } catch (error) {
    failures++;
    console.error(`Script ${index + 1}: ${error.message}`);
  }
});

const imageRefs = [...html.matchAll(/["'](images\/[^"']+\.(?:png|jpe?g|svg)(?:\?[^"']*)?)["']/g)]
  .map(match => match[1].split('?')[0])
  .filter(ref => !ref.includes('${'));
const missing = [...new Set(imageRefs)].filter(ref => !fs.existsSync(path.join(root, ref)));
missing.forEach(ref => {
  failures++;
  console.error(`Missing image: ${ref}`);
});

console.log(`${scripts.length} inline scripts parsed; ${imageRefs.length} image references checked; ${failures} failures.`);
process.exitCode = failures ? 1 : 0;
