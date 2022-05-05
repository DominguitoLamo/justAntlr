import { spawn } from 'child_process';
import { getActiveEditorDir } from './fs';
import { type } from 'os';
import * as iconv from 'iconv-lite';
import { rejects } from 'assert';

/**
 * launch a terminal in child process
 * @param command 
 * @param args 
 * @param cwd 
 */
export function launchTerminal(command: string, args: string[], cwd?: string) {
  let finalCwd: string;
  let outputResult: string = '';

  if (!cwd) {
    finalCwd = getActiveEditorDir();
  } else {
    finalCwd = cwd;
  }

  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: finalCwd
    });

    child.stdout.on('data', (data) => {
      if (data) {
        outputResult += iconv.decode(data, getTerminalEncoding());
      }
    });

    child.on('exit', (code) => {
      console.log('finish launch: ', code);
      resolve(outputResult);
    });

    child.stderr.on('data', (data) => {
      const result = iconv.decode(data, getTerminalEncoding());
      reject(result);
    });
  });
}

function getTerminalEncoding() {
  return type().toLowerCase().includes('windows') ? 'gbk' : 'utf8';
}