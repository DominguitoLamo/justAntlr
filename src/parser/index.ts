import { getSelectText } from "../util/editor";
import { InteractInfo, ParserInfo, TerminalInfo } from '../interface';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ensureDirSync } from 'fs-extra';
import { getActiveEditorDir, getActiveEditorPath } from "../util/fs";
import { BuildInfo, TargetLang } from "../buildInput";
import { generateAntlrProject, compileBuilt, getAntlrJarPath } from "../build";
import { launchTerminal } from "../util/terminal";
import { openInteractWebView } from "../webview";
import { join } from "path";

export async function parse(context: vscode.ExtensionContext) {
  const parseConfig: ParserInfo = {
    g4File: getActiveEditorPath(),
    rule: getSelectText() || "",
    parseType: 'gui',
    fileParsed: await getFileParsed()
  };

  // Empty file parsed
  if (!parseConfig.fileParsed) {
    return;
  }
  await buildAndCompile(parseConfig, context)
    // Error appears in the case of inaccurate grammar though the project generated is able to be compiled.
    .finally(async() => {
      await showGuiTree(parseConfig, context);
    });
}

export async function interact(context: vscode.ExtensionContext) {
  const interactConfig: InteractInfo = {
    g4File: getActiveEditorPath(),
    rule: getSelectText() || "",
    grammarName: getGrammarName(getActiveEditorPath()),
    text: '',
    saveText() {
      const savePath = join(getActiveEditorDir(), '.gen', this.grammarName, 'tmp.txt');
      fs.writeFileSync(savePath, this.text);
    },
    async getTokens() {
      const terminalInfo = getTokenCommand(this, context);
      const result = await launchTerminal(terminalInfo.command, terminalInfo.args, terminalInfo.cwd);
      console.log('tokens:', result);
    },
    async getAstTree() {
      const terminalInfo = getTokenCommand(this, context);
      const result = await launchTerminal(terminalInfo.command, terminalInfo.args, terminalInfo.cwd);
      console.log('ast tree:', result);
    },
    async getParsedResult(text: string) {
      this.text = text;
      this.saveText();
      await Promise.all([this.getTokens(), this.getAstTree()]);
    }
  };

  await buildAndCompile(interactConfig, context)
    .finally(async() => {
      openInteractWebView(context.extensionUri, context, interactConfig);
    });
}

async function getFileParsed() {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Open',
    defaultUri: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined
  };

  const file = await vscode.window.showOpenDialog(options);
  if (file && file.length > 0) {
    return file[0].fsPath;
  } else {
    return "";
  }
}

/**
 * build and config the grammar file with antlr so that the parsing is accessible.
 * @param parseConfig 
 * @param context 
 */
async function buildAndCompile(parseConfig: ParserInfo | InteractInfo, context: vscode.ExtensionContext) {
  const grammarName = getGrammarName(parseConfig.g4File);
  if (isCompile(grammarName)) {
    return;
  }
  await buildForparsing(grammarName, context)
    .finally(async () => {
      const compilePath = path.join(getGenDir(), grammarName);
      await compileBuilt(compilePath, context);
    });
}

function getGrammarName(filePath: string) {
  const fileName = path.basename(filePath);
  const splitArr = fileName.split('.');

  if (!splitArr || splitArr.length < 2) {
    vscode.window.showErrorMessage('No a grammar file');
    throw new Error('No a grammar file');
  } else {
    if (splitArr[1] !== 'g4' && splitArr[1] !== 'g') {
      vscode.window.showErrorMessage('No a grammar file');
      throw new Error('No a grammar file');
    }
  }

  return splitArr[0];
}
function isCompile(grammarName: string) {
  const compile = path.join(getGenDir(), grammarName);
  return fs.existsSync(compile);
}

async function buildForparsing(grammarName: string, context: vscode.ExtensionContext) {
  const buildInfo: BuildInfo = {
    target: TargetLang.JAVA,
    projectName: grammarName
  };
  const genDir = getGenDir();
  ensureDirSync(
    genDir
  );
  await generateAntlrProject(buildInfo, context, genDir);
}

/**
 * get the generated project dir path
 */
function getGenDir() {
  return path.join(getActiveEditorDir(), '.gen');
}

async function showGuiTree(parseConfig: ParserInfo, context: vscode.ExtensionContext) {
  const { command, args, cwd } = getTreeCommand(parseConfig, context);
  await launchTerminal(command, args, cwd);
}

function getTreeCommand(parseConfig: ParserInfo, context: vscode.ExtensionContext) {
  const grammarName = getGrammarName(parseConfig.g4File);
  const result: TerminalInfo = {
    command: 'java',
    args: ['-cp', `.;${getAntlrJarPath(context)}`, 'org.antlr.v4.gui.TestRig', grammarName, parseConfig.rule, '-gui', parseConfig.fileParsed],
    cwd: path.join(getGenDir(), grammarName)
  };

  return result;
}

function getTokenCommand(interactInfo: InteractInfo, context: vscode.ExtensionContext) {
  const parsedFile = path.join(getGenDir(), interactInfo.grammarName, 'tmp.txt');
  const result: TerminalInfo = {
    command: 'java',
    args: ['-cp', `.;${getAntlrJarPath(context)}`, 'org.antlr.v4.gui.TestRig', interactInfo.grammarName, interactInfo.rule, '-tokens', parsedFile],
    cwd: path.join(getGenDir(), interactInfo.grammarName)
  };

  return result;
}

function getAstTreeCommand(interactInfo: InteractInfo, context: vscode.ExtensionContext) {
  const parsedFile = path.join(getGenDir(), interactInfo.grammarName, 'tmp.txt');
  const result: TerminalInfo = {
    command: 'java',
    args: ['-cp', `.;${getAntlrJarPath(context)}`, 'org.antlr.v4.gui.TestRig', interactInfo.grammarName, interactInfo.rule, '-tree', parsedFile],
    cwd: path.join(getGenDir(), interactInfo.grammarName)
  };

  return result;
}



