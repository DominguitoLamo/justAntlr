import { ExtensionContext } from "vscode";

export function buildWithConfig(ctx: ExtensionContext) {
  const result = await collectInputs();
  return result;
}
