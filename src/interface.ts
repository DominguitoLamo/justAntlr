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

export interface InteractInfo {
  g4File: string,
  rule: string,
  text: string
}