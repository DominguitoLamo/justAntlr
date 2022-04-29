// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { build } from './build';
import { parse } from './parser';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const buildDisposable = vscode.commands.registerTextEditorCommand('justAntlr.build', async () => {
		await build(context);
	});

	const parseDisposible = vscode.commands.registerTextEditorCommand('justAntlr.genAST', () => {
		parse(context);
	});

	context.subscriptions.push(buildDisposable, parseDisposible);
}

// this method is called when your extension is deactivated
export function deactivate() {}
