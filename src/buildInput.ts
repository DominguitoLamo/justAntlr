import { ExtensionContext, window } from "vscode";
import { defaultBuild } from "./input/defaultBuild";

// build target language
export enum TargetLang {
  JAVA = 'java',
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

export async function buildInput(context: ExtensionContext) {
  let inputResult: BuildInfo;

  const options: { [key: string]: (ctx?: ExtensionContext) => Promise<BuildInfo> } = {
    defaultBuild
  };

  const quickPick = window.createQuickPick();
  quickPick.items = Object.keys(options).map(label => ({ label }));

  // selected event
  quickPick.onDidChangeSelection(async (selection) => {
    if (selection[0]) {
      try {
        inputResult = await options[selection[0].label](context);
      } catch(e) {
        console.log('Build Input Error');
        console.error(e);
      } 
    }
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}