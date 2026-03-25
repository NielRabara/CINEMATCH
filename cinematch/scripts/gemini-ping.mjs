import fs from "node:fs";
import path from "node:path";

function readEnvLocalValue(name) {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return "";
  const raw = fs.readFileSync(p, "utf8");
  const re = new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`, "m");
  const m = raw.match(re);
  if (!m) return "";
  const value = (m[1] || "").trim();
  return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

const key = process.env.GOOGLE_GEMINI_API_KEY || readEnvLocalValue("GOOGLE_GEMINI_API_KEY");
const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

console.log("key_present", Boolean(key), "len", key.length, "endsWith", key.slice(-4));

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gemini-2.5-flash",
    messages: [{ role: "user", content: 'Return ONLY ["Test"]' }],
    max_tokens: 30,
    stream: false,
  }),
});

const text = await res.text();
console.log("status", res.status);
console.log(text);
