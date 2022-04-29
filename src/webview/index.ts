import * as vscode from 'vscode';
import { readFileSync } from 'fs';
import * as path from 'path';

export function openInteractWebView(extensionUri: vscode.Uri, exctx: vscode.ExtensionContext) {
  InteractPanel.createOrShow(extensionUri, exctx);
}

class InteractPanel {
  public static currentPanel: InteractPanel | undefined;

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
  private readonly exctx: vscode.ExtensionContext
	private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, exctx: vscode.ExtensionContext) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (InteractPanel.currentPanel) {
			InteractPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			'JustAntlr:Interact',
			'Interacting with Grammar',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		InteractPanel.currentPanel = new InteractPanel(panel, extensionUri, exctx);
	}

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, exctx: vscode.ExtensionContext) {
		this._panel = panel;
		this._extensionUri = extensionUri;
    this.exctx = exctx;
		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);
	}

	private _update() {
    this._getHtmlForWebview();
	}

	private _getHtmlForWebview() {
    const webview = this._panel.webview;

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

    webview.html = this.getHtmlContentFromDisk();
	}

  private getWebViewSource(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
  }

  private getHtmlContentFromDisk() {
    const htmlPath = path.join(this.exctx.extensionPath, 'media', 'interact.html');
    const html = readFileSync(htmlPath);
    return html.toString('utf-8');
  }

	public dispose() {
		InteractPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}


function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
