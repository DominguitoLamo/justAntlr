import * as vscode from 'vscode';
import { extname } from 'path';

export function getSelectText(): { error: string, text: string } {
  let error = "", text = "";
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    error = 'No active editor';
    return { error, text };
  }
  const ext = extname(editor?.document.uri.path!);
  const acceptedTypes = ['.g', '.g4'];
  if (!acceptedTypes.find((el) => el === ext)) {
    error = `not supported file type: ${ext}, accepted ${acceptedTypes.join(',')}`;
    return { error, text };
  }

  const selection = editor?.selection;
  text = editor?.document.getText(selection) || "";
  if (!text) {
    error = `not selected text`;
    return { error, text };
  }
  return { error, text };
}