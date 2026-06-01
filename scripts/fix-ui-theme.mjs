import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

const replacements = [
  ["fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in", "modal-backdrop animate-fade-in"],
  ["bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col", "modal-panel max-w-lg mx-4"],
  ["bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden", "modal-panel max-w-md mx-4"],
  ["flex items-center justify-between p-6 border-b border-gray-100 shrink-0", "modal-header"],
  ["flex items-center justify-between p-6 border-b border-gray-100", "modal-header"],
  ["flex items-center justify-between p-6 border-b", "modal-header"],
  ["text-xl font-bold text-[#05335C]", "text-lg font-semibold text-white"],
  ["text-gray-400 hover:text-gray-600", "text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all"],
  ["<X className=\"w-5 h-5 text-gray-400\" />", "<X className=\"w-5 h-5\" />"],
  ["p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100", "alert-error"],
  ["font-semibold text-gray-700 border-b pb-2 mb-2", "form-section-title"],
  ["font-semibold text-gray-700 border-b pb-2 mt-6 mb-2", "form-section-title mt-6"],
  ["block text-sm font-medium text-gray-700 mb-1", "form-label-caps"],
  ["block text-sm font-medium mb-1", "form-label-caps"],
  ["p-6 border-t border-gray-100 flex gap-3 shrink-0", "modal-footer"],
  ["overflow-y-auto p-6", "modal-body"],
  ["<form onSubmit={onSubmit} className=\"p-6 space-y-4\">", "<form onSubmit={onSubmit} className=\"modal-body space-y-5\">"],
  ["grid grid-cols-2 gap-4", "grid grid-cols-1 sm:grid-cols-2 gap-4"],
  ["hover:bg-gray-50/50 transition-colors", "hover:bg-white/[0.03] transition-colors"],
  ["font-semibold text-[#05335C]", "font-semibold text-white"],
  ["text-xs text-gray-500", "text-xs text-white/40"],
  ["text-sm text-gray-600", "text-sm text-white/80"],
  ["text-sm text-gray-400", "text-sm text-white/40"],
  ["text-xs text-gray-400 mt-1", "text-xs text-white/30 mt-1"],
  ["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100", "badge badge-info"],
  ["badge bg-gray-100 text-gray-700", "badge badge-navy"],
  ["max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100", "modal-panel max-w-md mx-4 p-8"],
  ["bg-white rounded-2xl shadow-xl p-8 border border-gray-100", "glass-card p-8"],
  ["max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-10 border border-gray-100", "glass-card max-w-lg mx-auto p-8 sm:p-10"],
  ["max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-10 text-center", "glass-card max-w-lg mx-auto p-8 sm:p-10 text-center"],
  ["hover:bg-gray-50/50 transition-colors", "hover:bg-white/[0.03] transition-colors"],
  ["hover:bg-gray-50/50", "hover:bg-white/[0.03]"],
  ["hover:bg-gray-50", "hover:bg-white/[0.03]"],
  ["text-gray-700", "text-white/80"],
  ["text-gray-500", "text-white/40"],
  ["text-gray-400", "text-white/30"],
  ["bg-gray-50 border border-gray-100", "border border-white/[0.08] bg-white/[0.02]"],
  ["border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50", "border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]"],
  ["border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50", "border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02]"],
  ["border-b border-gray-100", "border-b border-white/[0.06]"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) {
      let content = fs.readFileSync(p, "utf8");
      let orig = content;
      for (const [from, to] of replacements) {
        if (from === "className=\"form-input\"" && to === "className=\"form-select\"") continue;
        content = content.split(from).join(to);
      }
      // select fields in modals
      content = content.replace(/<select([^>]*) className="form-input"/g, '<select$1 className="form-select"');
      if (content !== orig) {
        fs.writeFileSync(p, content, "utf8");
        console.log("updated", path.relative(root, p));
      }
    }
  }
}

walk(root);
console.log("done");
