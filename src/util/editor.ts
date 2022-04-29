import * as vscode from 'vscode';

export function getSelectText() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
  }

  const selection = editor?.selection;
  
  return editor?.document.getText(selection);
}