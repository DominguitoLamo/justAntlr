import { posix } from "path";
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

async function generateAntlrProject(buildInfo: BuildInfo, ctx: ExtensionContext) {
  const command = getGenerateCommand(buildInfo, ctx);
  await launchTerminal(command.command, command.args);
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

  if (buildInfo.packageName) {
    result.args.push('-package', buildInfo.packageName);
  }

  return result;
}

/**
 * get antlr jar path
 * @param ctx 
 */
function getAntlrJarPath(ctx: ExtensionContext) {
  const jarPath = posix.join(ctx.extensionPath, 'lib', 'antlr-4.10.1-complete.jar');
  return jarPath;
}

function getTargetCommand(lang: string) {
  return `-Dlanguage=${lang}`;
}