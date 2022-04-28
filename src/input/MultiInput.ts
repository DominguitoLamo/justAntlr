// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------

import { Disposable, QuickInput, QuickInputButtons, QuickPickItem, window } from "vscode";

// Enum marks the direction of the steps
enum InputFlowAction {
  BACK,
  CANCEL,
  RESUME
}

/**
 * step function interface
 */
export type InputStep<T extends unknown> = (input: MultiStepInput<T>, result: T) => Promise<void>;

/**
 * wrap the select options parameters
 */
export interface QuickPickParameters<T extends QuickPickItem> {
	title: string;
	step: number;
	totalSteps: number;
	items: T[]; // options
	activeItem?: T; // options selected
	placeholder: string;
}

/**
 * wrap the input options parameters
 */
export interface InputBoxParameters {
	title: string;
	step: number;
	totalSteps: number;
	value?: string;
	prompt: string;
}

/**
 * encapsulate the multiinput step through functions
 * @param steps 
 * @param result 
 * @returns 
 */
export async function runMultiInput<T extends unknown>(steps: InputStep<T>[], result: T) {
  const input = new MultiStepInput(steps);
  await input.stepThrough(result);
  return result;
}

export class MultiStepInput<T> {
	private current?: QuickInput;
	private steps: InputStep<T>[] = [];
  private stepIndex: number;

  constructor(steps: InputStep<T>[]) {
    this.steps = steps;
    this.stepIndex = 0;
  }

	public async stepThrough(result: T) {
    // step 1
		let step: InputStep<T> | void = this.steps[0];
		while (step) {
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				await step(this, result);
        step = this.steps[++this.stepIndex];
			} catch (err) {
				if (err === InputFlowAction.BACK) {
					this.stepIndex = --this.stepIndex;
					step = this.steps[this.stepIndex];
				} else if (err === InputFlowAction.RESUME) {
					step = this.steps[this.stepIndex];
				} else if (err === InputFlowAction.CANCEL) {
					step = undefined;
				} else {
					throw err;
				}
			}
		}
		if (this.current) {
			this.current.dispose();
		}
	}

  /**
   * select function
   * @param param
   * @returns 
   */
	async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				// open select window
				const input = window.createQuickPick<T>();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.placeholder = placeholder;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.BACK);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(InputFlowAction.CANCEL);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

  /**
   * input function
   * @param param0 
   * @returns 
   */
	async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<string | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				// open inputbox window
				const input = window.createInputBox();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.value = value || '';
				input.prompt = prompt;
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.BACK);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
            resolve(value);
						input.enabled = true;
						input.busy = false;
					}),
					input.onDidHide(() => {
						(async () => {
							reject(InputFlowAction.CANCEL);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}
