// src/components/Editor.tsx

import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const startState = EditorState.create({
        doc: '# Hello, Grapha!\n\nThis is your new Obsidian-like editor.\n\n- Start typing...\n- Markdown is **supported**!',
        extensions: [
          keymap.of(defaultKeymap),
          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
          }),
          oneDark, // Using a professional dark theme
          // Custom theme overrides to match our app's background
          EditorView.theme({
            '&': {
              backgroundColor: 'var(--color-background)',
              height: '100%',
            },
            '.cm-content': {
              caretColor: '#fff',
            },
            '.cm-gutters': {
              backgroundColor: 'var(--color-background)',
              borderRight: '1px solid var(--color-border)',
            },
          })
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      viewRef.current = view;
    }

    // Cleanup function to destroy the editor instance when the component unmounts
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

export default Editor;