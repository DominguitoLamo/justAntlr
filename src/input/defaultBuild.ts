import { BuildInfo, TargetLang } from "../buildInput";

/**
 * The default build case. The project is built with Java and is named gen.
 */
export function defaultBuild() {
  const defaultInput: BuildInfo = {
    target: TargetLang.JAVA,
    projectName: 'gen'
  };
  return Promise.resolve(defaultInput);
}