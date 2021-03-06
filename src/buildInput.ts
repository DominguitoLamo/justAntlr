import { rejects } from "assert";
import { ExtensionContext, QuickPick, QuickPickItem, window } from "vscode";
import { buildWithConfig } from "./input/buildWtihConfig";
import { defaultBuild } from "./input/defaultBuild";

// build target language
export enum TargetLang {
  JAVA = 'Java',
  GO = 'Go',
  JAVASCRIPT = 'Javascript',
  PHP = 'PHP',
  PYTHON3 = 'Python3',
  PYTHON2 = 'Python2',
  CPP = 'Cpp',
  DART = 'Dart',
  SWIFT = 'Swift'
}

export interface BuildInfo {
  target: TargetLang,
  packageName?: string,
  projectName: string
}

/**
 * get build information from input
 * @param context 
 */
export async function buildInput(context: ExtensionContext) {
  let inputResult: BuildInfo;

  const options: { [key: string]: (ctx?: ExtensionContext, quickPick?: QuickPick<QuickPickItem>) => Promise<BuildInfo> } = {
    defaultBuild,
    buildWithConfig
  };

  return new Promise<BuildInfo>((resolve, rejects) => {
    const quickPick = window.createQuickPick();
    quickPick.items = Object.keys(options).map(label => ({ label }));
  
    // selected event
    quickPick.onDidChangeSelection(async (selection) => {
      if (selection[0]) {
        try {
          inputResult = await options[selection[0].label](context, quickPick);
          resolve(inputResult);
        } catch(e) {
          console.log('Build Input Error');
          rejects(e);
        } 
      }
    });
  
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });
}