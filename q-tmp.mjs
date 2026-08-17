import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split("\n").filter(l=>l.includes("=")).map(l=>[l.slice(0,l.indexOf("=")), l.slice(l.indexOf("=")+1).replace(/^"|"$/g,"")]));
const sql = neon(env.DATABASE_URL);
const ARM = "[\\u0530-\\u058F]";

console.log("=== every jsonb column ===");
const jc = await sql.query(`select table_name, column_name from information_schema.columns where table_schema='public' and data_type='jsonb'`);
for (const c of jc) {
  try {
    const r = await sql.query(`select count(*)::int as n from "${c.table_name}" where "${c.column_name}"::text ~ '${ARM}'`);
    if (r[0].n > 0) console.log(`   >>> ${c.table_name}.${c.column_name}: ${r[0].n}`);
  } catch { /* skip */ }
}

console.log("\n=== mbti_interpretation_library: which column? ===");
const mc = await sql.query(`select column_name from information_schema.columns where table_name='mbti_interpretation_library' and data_type in ('text','character varying')`);
for (const c of mc) {
  const r = await sql.query(`select count(*)::int as n from mbti_interpretation_library where "${c.column_name}" ~ '${ARM}'`);
  if (r[0].n) {
    console.log(`   ${c.column_name}: ${r[0].n}`);
    const ex = await sql.query(`select "${c.column_name}" as v from mbti_interpretation_library where "${c.column_name}" ~ '${ARM}' limit 1`);
    const m = ex[0].v.match(new RegExp(`.{0,40}${ARM}.{0,40}`));
    console.log(`     …${m?.[0]}…  codepoints: ${[...(m?.[0]||"")].filter(ch=>ch>="԰"&&ch<="֏").map(ch=>"U+"+ch.codePointAt(0).toString(16).toUpperCase())}`);
  }
}
