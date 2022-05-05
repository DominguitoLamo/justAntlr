const createApp = PetiteVue.createApp;
const vscode = acquireVsCodeApi();
let tokens = [];
// Handle messages sent from the extension to the webview
window.addEventListener('message', event => {
  const message = event.data; // The json data that the extension sent
  switch (message.command) {
      case 'tokens':
          tokens = JSON.parse(message.data);
          console.log(tokens);
          break;
  }
});

createApp({
  // exposed to all expressions
  tabType: 'astTree',
  textParsed: '',
  tokens: [],

  // methods
  changeTabType(type) {
    this.tabType = type;
  },

  mounted() {
    console.log('mounted');
  },

  // get Tokens
  getTokens() {
    // Send a message back to the extension
    vscode.postMessage({
      command: 'tokens',
      text: this.textParsed
    });
    setTimeout(() => {
      this.tokens = tokens;
    }, 1000);
  },

  getAstGui() {
    // Send a message back to the extension
    vscode.postMessage({
      command: 'ast',
      text: this.textParsed
    });
  }
}).mount();