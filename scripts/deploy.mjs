import fs from "node:fs/promises";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, ".deployment");
if (!(await fs.stat(path.join(root, "site/circuitjs1/circuitjs1.nocache.js"))).isFile()) throw new Error("Run Build.cmd first");
try { await fs.access(path.join(out, "official/circuitjs.html")); }
catch {
  const difference = execFileSync("git", ["diff", "5a707168778216bb6ed01bfdd62e8bbf7ae0a032", "--", "src"], { cwd: root, encoding: "utf8" });
  if (difference.trim()) throw new Error("Build the official source first to create the preserved official workspace");
  await fs.cp(path.join(root, "site"), path.join(out, "official"), { recursive: true });
}
await fs.cp(path.join(root, "site"), path.join(out, "custom"), { recursive: true });
let html = await fs.readFile(path.join(out, "custom/circuitjs.html"), "utf8");
html = html.replace(/<link rel="manifest"[^>]*>/g, "").replace(/<script>\s*if \('serviceWorker'[\s\S]*?<\/script>/g, "").replace("<head>", '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">');
await fs.writeFile(path.join(out, "custom/circuitjs.html"), html);
let cases = [];
try { cases = JSON.parse(await fs.readFile(path.join(root, "../maintenance knowledge/simulation/cases.json"), "utf8")).cases; } catch (e) { if (e.code !== "ENOENT") throw e; }
const lz = {};
vm.runInNewContext(await fs.readFile(path.join(root, "war/lz-string.min.js"), "utf8"), lz);
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
await fs.writeFile(path.join(out, "index.html"), `<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CircuitJS1 本地维修实验</title><style>body{font:16px system-ui;max-width:960px;margin:32px auto;padding:16px;line-height:1.8;background:#101822;color:#eef}a{color:#8ed5ff}section{border-bottom:1px solid #456;padding:12px}a{display:inline-block;margin:6px}</style><h1>CircuitJS1 本地维修实验</h1><p><a href="official/circuitjs.html">官方原版</a><a href="custom/circuitjs.html">自定义工作区</a><a href="http://127.0.0.1:4173">维修知识库（先运行其 Start.cmd）</a></p><p>本服务只监听本机；手机请通过知识库的同源实验入口访问。修改电路后用文件菜单导出；所有案例为教学模型。</p>${cases.map((c) => `<section><h2>${esc(c.title)}</h2><p>${esc(c.components)}</p>${c.states.map((s) => `<a href="custom/circuitjs.html?lang=zh&amp;hideSidebar=true&amp;ctz=${lz.LZString.compressToEncodedURIComponent(s.circuit)}">${esc(s.label)}</a>`).join(" ")}<p>${esc(c.limits)}</p></section>`).join("")}</html>`);
console.log("Deployed official and custom workspaces to .deployment (source engine unchanged).");
