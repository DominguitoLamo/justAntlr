export interface TerminalInfo {
  command: string,
  args: string[],
  cwd?: string
}

export interface ParserInfo {
  g4File: string,
  fileParsed: string,
  rule: string,
  parseType: 'tokens' | 'gui' | 'tree'
}