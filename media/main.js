const createApp = PetiteVue.createApp;
const vscode = acquireVsCodeApi();

createApp({
  // exposed to all expressions
  tabType: 'astTree',
  textParsed: '',

  // methods
  changeTabType(type) {
    this.tabType = type;
  },

  sendText() {
    // Send a message back to the extension
    vscode.postMessage({
      command: 'parse',
      text: this.textParsed
    });
  }
}).mount();