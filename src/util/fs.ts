import { posix } from 'path';
import * as vscode from 'vscode';

/**
 * assert the extname of active editor
 * @param extName 
 * @returns 
 */
export function assertActiveEditorExtName(extName: string) {
  if (
    !vscode.window.activeTextEditor
    || posix.extname(vscode.window.activeTextEditor.document.uri.path) !== extName
  ) {
    return false;
  }

  return true;
}

function joinFilePath(basePath: string, paths?: string[]) {
  if (!paths || paths.length === 0) {
    return basePath;
  }

  return posix.join(basePath, ...paths);
}

export function joinWorkSpacePath(...path: string[]) {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showInformationMessage('No folder or workspace opened');
    throw new Error('no workspace folder');
  }

  const basePath = vscode.workspace.workspaceFolders[0].uri.path;

  return joinFilePath(basePath, path);
}

export function getActiveEditorDir() {
  if(!vscode.window.activeTextEditor) {
    vscode.window.showErrorMessage("No active editor");
    return "";
  }

  const activePath = vscode.window.activeTextEditor.document.uri.path;

  return posix.dirname(activePath);
}