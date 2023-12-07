import { OutputChannel, window } from "vscode";

export class Log {
  private logInstance: OutputChannel | null = null;
  init() {
    this.logInstance = window.createOutputChannel("justAntlr");
    this.logInstance.show();
  }
  output(log: string) {
    if (this.logInstance) {
      this.logInstance.appendLine(log);
    }
  }
}
export const log = new Log();
