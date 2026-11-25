/* run-iso-checks-all.cjs: the kit's clean-pixels checks, including the v1.1 rule "sign / caption / card covers a person or a key prop"
   (stage widths 320, 560, 960, with the keep-out camera nudge), on all four handbook batches (81 policies).
     node tools/run-iso-checks-all.cjs [--quiet] [--only=<id,id>]       exit code 1 when anything is reported
   It runs the kit's tools/check-specs.cjs (found at ../iso-explainer-kit/tools) against this repo's own iso/ copy of the kit. */
'use strict';
const path = require('path'), fs = require('fs'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..'), KIT_TOOLS = path.resolve(ROOT, '..', 'iso-explainer-kit', 'tools', 'check-specs.cjs');
if (!fs.existsSync(KIT_TOOLS)) { console.error('check-specs.cjs not found (expected ../iso-explainer-kit/tools)'); process.exit(2); }
const iso = path.join(ROOT, 'iso'), files = ['A', 'B', 'C', 'D'].map((b) => path.join(iso, 'hb-iso-' + b + '.js'));
const r = cp.spawnSync(process.execPath, [KIT_TOOLS, iso, ...files, '--actions', '--no-poses', '--speaker-auto', ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status === null ? 2 : r.status);
