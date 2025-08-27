import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { LanguageDescription } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

// --- Start: Import specific languages ---
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
// --- End: Import specific languages ---

interface EditorProps {
  doc: string;
}

const Editor: React.FC<EditorProps> = ({ doc }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const startState = EditorState.create({
        doc: doc,
        extensions: [
          keymap.of(defaultKeymap),
          markdown({
            base: markdownLanguage,
            // --- Use the specific languages we imported ---
            codeLanguages: (info: string) => {
              // This function allows for dynamic language loading
              // For now, we support JS, TS, HTML, and CSS
              if (info === "js" || info === "javascript") return javascript();
              if (info === "ts" || info === "typescript") return javascript({ typescript: true });
              if (info === "html") return html();
              if (info === "css") return css();
              // Return null for unsupported languages to avoid errors
              return null;
            }
          }),
          oneDark,
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

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (doc !== currentDoc) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: doc || '' },
        });
      }
    }
  }, [doc]);

  return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

export default Editor;
