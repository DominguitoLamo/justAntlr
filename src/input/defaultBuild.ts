import { ExtensionContext, QuickPick, QuickPickItem, window } from "vscode";
import { BuildInfo, TargetLang } from "../buildInput";

/**
 * The default build case. The project is built with Java and is named gen.
 */
export function defaultBuild(ctx?: ExtensionContext, quickPick?: QuickPick<QuickPickItem>) {
  const defaultInput: BuildInfo = {
    target: TargetLang.JAVA,
    projectName: 'gen'
  };
  quickPick?.dispose();
  return Promise.resolve(defaultInput);
}