'use client';

import { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';

export default function TemplateEditorPage() {
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  // load template
  useEffect(() => {
    fetch('/api/template')
      .then(r => r.json())
      .then(d => setCode(d.content || ''));
  }, []);

  // highlight variables {like_this}
  const highlight = (text) =>
    Prism.highlight(text, Prism.languages.markup, 'markup')
      .replace(/\{[^}]+\}/g, m =>
        `<span style="background:#fde68a;color:#92400e;font-weight:bold">${m}</span>`
      );

  // block variable editing
  const safeSetCode = (newCode) => {
    const oldVars = code.match(/\{[^}]+\}/g) || [];
    const newVars = newCode.match(/\{[^}]+\}/g) || [];

    if (oldVars.join('|') !== newVars.join('|')) return;

    setCode(newCode);
  };

  const save = async () => {
    setSaving(true);

    await fetch('/api/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: code }),
    });

    setSaving(false);
    alert('Template saved');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Rotary Email Template Editor</h1>

      <Editor
        value={code}
        onValueChange={safeSetCode}
        highlight={highlight}
        padding={16}
        className="border rounded min-h-[450px] font-mono text-sm bg-white"
      />

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? 'Saving...' : 'Save Template'}
      </button>
    </div>
  );
}
