// a implementation of ircmp.py in node 
// https://gist.github.com/woofledev/846cb0d2f382d3fdb45a5318613b9643
const fs = require('fs');
function compilef(inputfile) {
  const inpc = fs.readFileSync(inputfile.trim(), 'utf-8');
  let outc = inpc;
  const tagged = [];
  inpc.split('\n').forEach(l => {
    if (l.trim().startsWith('// [ircmp]')) {
      console.log("found tag "+l.split('// [ircmp] ')[1])
      tagged.push(l.split('// [ircmp] ')[1]);
    }
  });
  tagged.forEach(t => {
    const tag = `// [ircmp] ${t}`;
    console.log(`replace "${tag.trim()}" with file ${t.trim()}`)
    if (outc.includes(tag)) {
    try {
        let tagc = fs.readFileSync(t.trim(), 'utf-8');
      if (tagc.includes('// [ircmp]')) {
        tagc = compilef(t);
      }
      outc = outc.replace(tag, tagc);
    } catch {
        console.log(`${t.trim()} couldn\'t be read. skipping`);
    }
    }
  });
  return outc;
}
if (require.main === module) {
  const inputfile = process.argv[2].trim();
  const outputFile = process.argv[3].trim();
  const outc = compilef(inputfile);
  fs.writeFileSync(outputFile, outc, 'utf-8');
  console.log("")
}
