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
  compiledPath: string
  g4File: string,
  rule: string,
  text: string,
  grammarName: string,
  saveText: () => void,
  getTokens: () => Promise<void>,
  getAstTree: () => Promise<void>,
  getParsedResult: (text: string) => Promise<void>
}

export interface TokenInfo {
  type: string,
  text: string,
  start: number,
  end: number,
  row: number
}