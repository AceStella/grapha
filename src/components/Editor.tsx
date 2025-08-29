import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

interface EditorProps {
  doc: string;
  onChange: (newDoc: string) => void; // Add onChange prop
}

const Editor: React.FC<EditorProps> = ({ doc, onChange }) => {
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
            codeLanguages: (info: string) => {
              if (info === "js" || info === "javascript") return javascript();
              if (info === "ts" || info === "typescript") return javascript({ typescript: true });
              if (info === "html") return html();
              if (info === "css") return css();
              return null;
            }
          }),
          oneDark,
          EditorView.theme({
            '&': { backgroundColor: 'var(--color-background)', height: '100%' },
            '.cm-content': { caretColor: '#fff' },
            '.cm-gutters': { backgroundColor: 'var(--color-background)', borderRight: '1px solid var(--color-border)' },
          }),
          // --- Add listener for document changes ---
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }
          })
        ],
      });

      const view = new EditorView({ state: startState, parent: editorRef.current });
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
