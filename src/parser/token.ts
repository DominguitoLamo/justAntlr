import * as os from 'os';
import { TokenInfo } from '../interface';

export function parseToken(text: string) {
  // filter line delimiter
  const parses = text.split(os.EOL).filter(item => item[0] === '[');
  const result: TokenInfo[] = [];

  for (let i = 0; i < parses.length; i++) {
      // trim the bracket and split
      const parsed = parses[i].substring(1, parses[i].length - 1);
      const tokenInfo = new Token(parsed).getTokenInfo();
      result.push(tokenInfo);
  }
  
    return result;
}

class Token {
  private readonly parsedText: string;
  private readonly tokenInfo: TokenInfo;
  private index: number;

  constructor(parsedText: string) {
    this.parsedText = parsedText;
    this.tokenInfo = {
      type: "",
      text: "",
      start: 0,
      end: 0,
      row: 1
    };
    this.index = 0;
  }

  // parsing the token text. Its format is '[@0,0:6='Details',<TEXT>,1:0]'
  getTokenInfo() {
    // skip the index info
    while (this.peek() !== ',') {
      this.index++;
      continue;
    }
    // skip comma
    this.index++;

    this.getStartAndEnd();
    this.getText();

    // skip comma
    this.index++;
    this.getType();
    // skip comma
    this.index++;
    this.getRow();

    return this.tokenInfo;
  }

  private getStartAndEnd() {
    let start = '';
    while (this.peek() !== ':') {
      start += this.peek();
      this.index++;
    }

    this.tokenInfo.start = parseInt(start);
    this.index++;

    let end = '';
    while (this.peek() !== '=') {
      end += this.peek();
      this.index++;
    }

    this.tokenInfo.end = parseInt(end);
    this.index++;
  }

  private getText() {
    if (this.peek() !== "'") {
      throw new Error('Parsing error: not parsing text');
    }
    this.index++;

    let text = "";
    // get text until meet single quote
    while (this.peek() !== "'") {
      text += this.peek();
      this.index++;
    }
    this.tokenInfo.text = text;
    this.index++;
  }

  private getType() {
    if (this.peek() !== '<') {
      throw new Error('Parsing error: not parsing text');
    }
    this.index++;

    let type = "";
    // get type until meet single quote
    while (this.peek() !== ">") {
      type += this.peek();
      this.index++;
    }
    this.tokenInfo.type = type;
    this.index++;
  }

  private getRow() {
    let row = "";
    while (this.peek() !== ':') {
      row += this.peek();
      this.index++;
    }

    this.tokenInfo.row = parseInt(row);
  }

  private peek() {
    return this.parsedText[this.index];
  }
}
