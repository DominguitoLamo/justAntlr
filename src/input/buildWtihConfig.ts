import { BuildInfo, TargetLang } from "../buildInput";
import { MultiStepInput, runMultiInput } from "./MultiInput";

const TITLE = 'Build with Configuration';

export async function buildWithConfig() {
  const result: BuildInfo = {
    target: TargetLang.JAVA,
    projectName: 'gen'
  };

  await runMultiInput([
    getTargetName,
    getProjectName,
    getPackageName
  ], result);

  return Promise.resolve(result);
}

async function getTargetName(input: MultiStepInput<BuildInfo>, result: BuildInfo) {
  const targetLangNames = [
    TargetLang.JAVA,
    TargetLang.GO,
    TargetLang.JAVASCRIPT,
    TargetLang.PHP,
    TargetLang.PYTHON3,
    TargetLang.PYTHON2,
    TargetLang.CPP,
    TargetLang.DART,
    TargetLang.SWIFT
  ].map(item => {
      return { label: item };
    });

  const targetName = await input.showQuickPick({
    title: TITLE,
    step: 1,
    totalSteps: 3,
    placeholder: 'Pick a resource group',
    items: targetLangNames,
  });

  result.target = targetName.label as TargetLang;
}

async function getProjectName(input: MultiStepInput<BuildInfo>, result: BuildInfo) {
  const val = await input.showInputBox({
    title: TITLE,
    step: 2,
    totalSteps: 3,
    prompt: 'enter project name'
  });
  result.projectName = val;
}

async function getPackageName(input: MultiStepInput<BuildInfo>, result: BuildInfo) {
  const val = await input.showInputBox({
    title: TITLE,
    step: 2,
    totalSteps: 3,
    prompt: 'enter package name'
  });
  result.packageName = val;
}