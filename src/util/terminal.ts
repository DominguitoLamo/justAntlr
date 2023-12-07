import { spawn } from 'child_process';
import { getActiveEditorDir } from './fs';
import { type } from 'os';
import * as iconv from 'iconv-lite';
import { rejects } from 'assert';
import { log } from "./log";

/**
 * launch a terminal in child process
 * @param command 
 * @param args 
 * @param cwd 
 */
export function launchTerminal(command: string, args: string[], cwd?: string): Promise<string> {
  let finalCwd: string;
  let outputResult: string = '';

  if (!cwd) {
    finalCwd = getActiveEditorDir();
  } else {
    finalCwd = cwd;
  }

  return new Promise<string>((resolve, reject) => {
    log.output(`run command in ${finalCwd}:\n${command} ${args.join(' ')}`);
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
      log.output(outputResult);
      resolve(outputResult);
    });

    child.stderr.on('data', (data) => {
      const result = iconv.decode(data, getTerminalEncoding());
      log.output(result);
      reject(result);
    });
  });
}

function getTerminalEncoding() {
  return type().toLowerCase().includes('windows') ? 'gbk' : 'utf8';
}