import { join, posix } from "path";
import { existsSync, readdirSync } from 'fs';
import { ExtensionContext } from "vscode";
import { BuildInfo, buildInput, TargetLang } from "./buildInput";
import { TerminalInfo } from "./interface";
import { getActiveEditorPath } from "./util/fs";
import { launchTerminal } from "./util/terminal";

// build antlr project
export async function build(context: ExtensionContext) {
  let buildInfo: BuildInfo;
  try {
    buildInfo = await buildInput(context);
    await generateAntlrProject(buildInfo, context);
  } catch (e) {
    console.error(e);
  }
}

export async function generateAntlrProject(buildInfo: BuildInfo, ctx: ExtensionContext, cwd?: string) {
  const command = getGenerateCommand(buildInfo, ctx);
  await launchTerminal(command.command, command.args, cwd);
}

function getGenerateCommand(buildInfo: BuildInfo, ctx: ExtensionContext) {
  const result: TerminalInfo = {
    command: 'java',
    args: ['-jar', getAntlrJarPath(ctx)]
  };

  if (buildInfo.target !== TargetLang.JAVA) {
    result.args.push(getTargetCommand(buildInfo.target));
  }

  result.args.push('-o', buildInfo.projectName, getActiveEditorPath());
  result.args.push('-visitor');

  if (buildInfo.packageName) {
    result.args.push('-package', buildInfo.packageName);
  }

  return result;
}

/**
 * get antlr jar path
 * @param ctx 
 */
export function getAntlrJarPath(ctx: ExtensionContext) {
  const jarPath = posix.join(ctx.extensionPath, 'lib', 'antlr-4.10.1-complete.jar');
  return jarPath;
}

function getTargetCommand(lang: string) {
  return `-Dlanguage=${lang}`;
}

export async function compileBuilt(compilePath: string, context: ExtensionContext) {
  if (!existsSync(compilePath)) {
    throw new Error('No compile Path');
  }
  setTimeout(async() => {
    const terminalInfo = getCompileCommand(compilePath, context);
    await launchTerminal(terminalInfo.command, terminalInfo.args);
  }, 1000);
}

function getCompileCommand(compilePath: string, context: ExtensionContext, isAllCompile: boolean = true) {

  const result: TerminalInfo = {
    command: 'javac',
    args: ['-cp', `.;${getAntlrJarPath(context)}`]
  };
  if (isAllCompile) {
    const javaFilesPath = getJavaFilesPath(compilePath);
    result.args.push(...javaFilesPath);
  } else {
    result.args.push(compilePath);
  }

  return result;
}

function getJavaFilesPath(compilePath: string) {
  const paths = readdirSync(compilePath).filter(item => item.includes('.java'))
    .map(item => {
      return join(compilePath, item);
    });

    return paths;
}