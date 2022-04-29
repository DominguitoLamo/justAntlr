import { getSelectText } from "../util/editor";
import { ParserInfo } from '../interface';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ensureDirSync } from 'fs-extra';
import { getActiveEditorDir, getActiveEditorPath } from "../util/fs";
import { InputStep, MultiStepInput, runMultiInput } from "../input/MultiInput";
import { BuildInfo, TargetLang } from "../buildInput";
import { generateAntlrProject, compileBuilt } from "../build";

export async function parse(context: vscode.ExtensionContext) {
  const parseConfig: ParserInfo = {
    g4File: getActiveEditorPath(),
    rule: getSelectText() || "",
    parseType: 'gui',
    fileParsed: await getFileParsed()
  };
  await buildAndCompile(parseConfig, context);
}

async function getFileParsed() {
  const inputFilePath: InputStep<string> =async (input: MultiStepInput<string>, result: string) => {
    const inputValue = await input.showInputBox({
      title: 'Input the relative path of the file parsed in the workspace.',
      step: 1,
      totalSteps: 1,
      prompt: 'Input the path, e.g foo/bar',
    });

    return inputValue;
  };

  const result = await runMultiInput([inputFilePath], "");

  return result;
}

/**
 * build and config the grammar file with antlr so that the parsing is accessible.
 * @param parseConfig 
 * @param context 
 */
async function buildAndCompile(parseConfig: ParserInfo, context: vscode.ExtensionContext) {
  const grammarName =  getGrammarName(parseConfig.g4File);
  if (isCompile(grammarName)) {
    return;
  }
  await buildForparsing(grammarName, context);
  const compilePath = path.join(getGenDir(), grammarName);
  await compileBuilt(compilePath, context);
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

