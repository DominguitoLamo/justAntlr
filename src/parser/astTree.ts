import { AstTreeInfo } from "../interface";

export function parseAstTree(text: string) {
  // trim the bracket
  return new AstParser(text.trimLeft().trimRight()).getNonterminal();
}

class AstParser {
  private readonly parsed: string;
  private index: number;

  constructor(text: string) {
    this.parsed = text;
    this.index = 0;
  }
 
  getNonterminal() {
    if (this.peek() !== '(') {
      throw new Error('Non-terminal should start with left bracket');
    }
    this.index++;
    const info: AstTreeInfo = {
      text: {
        name: this.getName(),
        title: 'non-terminal'
      },
      children: []
    };
    // skip space
    this.skipSpace();
    // add children
    while (this.peek() !== ')') {
      this.skipSpace();
      if (this.peek() === '(') {
        info.children?.push(this.getNonterminal());
        
      } else {
        info.children?.push(this.getTerminal());
      }
    }
    console.log('ast info: ',info);
    console.log('peek: ', this.peek());
    this.index++;

    return info;
  }

  private getTerminal() {
    const info: AstTreeInfo = {
      text: {
        name: this.getTerminalName(),
        title: 'terminal'
      }
    };

    return info;
  }

  private getTerminalName() {
    let name = "";
    // is space
    if (this.isSpace()) {

      this.index++;
      name = this.peek();
    } else {
      while (this.peek() !== ')') {
        name += this.peek();
        this.index++;
      }
    }

    return name;
  }


  private getName() {
    let name = "";
    while (!this.isSpace()) {
      name += this.peek();
      this.index++;
    }

    return name;
  }

  private peek() {
    if (this.index > this.parsed.length) {
      return '';
    }

    return this.parsed[this.index];
  }

  private isDigit() {
    return /[0-9]/.test(this.peek());
  }

  private isChar() {
    return /[a-zA-Z]/.test(this.peek());
  }

  private peekNext() {
    if (this.index + 1 > this.parsed.length) {
      return '';
    }

    return this.parsed[this.index + 1];
  }

  private isSpace() {
    return /[ \t\r\n]/.test(this.peek());
  }

  private skipSpace() {
    if (/[ \t\r\n]/.test(this.peek())) {
      this.index++;
    }
  }

  private isEnd() {
    return /[\t\r\n\)]/.test(this.peek());
  }
}