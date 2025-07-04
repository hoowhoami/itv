import { defineStore } from 'pinia';

export interface Parser {
  key: string;
  name: string;
  url: string;
  deletable: boolean;
}

interface ParserState {
  parsers: Parser[];
}

export const useParserStore = defineStore('parser', {
  // 持久化
  persist: true,

  state: (): ParserState => ({
    parsers: [],
  }),

  // 获取器
  getters: {
    getParsers: (state: ParserState) => {
      return state.parsers;
    },
  },

  // 动作
  actions: {
    addParser(parser: Parser) {
      this.parsers.push(parser);
    },
    deleteParser(parser: Parser) {
      this.parsers = this.parsers.filter((p) => p.key !== parser.key);
    },
  },
});
