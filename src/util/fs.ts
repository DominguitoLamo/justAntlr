import * as pathModule from 'path';
import * as vscode from 'vscode';
import { type } from 'os';

const path = type().toLowerCase().includes('windows') ? pathModule.win32 : pathModule.posix;

/**
 * assert the extname of active editor
 * @param extName 
 * @returns 
 */
export function assertActiveEditorExtName(extName: string) {
  if (
    !vscode.window.activeTextEditor
    || path.extname(vscode.window.activeTextEditor.document.uri.path) !== extName
  ) {
    return false;
  }

  return true;
}

function joinFilePath(basePath: string, paths?: string[]) {
  if (!paths || paths.length === 0) {
    return basePath;
  }

  return path.join(basePath, ...paths);
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

  const activePath = vscode.window.activeTextEditor.document.uri.fsPath;
  const dirPath = path.dirname(activePath);
  return dirPath;
}

export function getActiveEditorPath() {
  if(!vscode.window.activeTextEditor) {
    vscode.window.showErrorMessage("No active editor");
    return "";
  }

  const activePath = vscode.window.activeTextEditor.document.uri.fsPath;

  return activePath;
}