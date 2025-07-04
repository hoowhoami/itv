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
    parsers: [
      {
        key: 'xmjx',
        name: '虾米解析',
        url: 'https://jx.xmflv.com/?url={url}',
        deletable: false,
      },
      {
        key: 'xmjx2',
        name: '虾米解析2',
        url: 'https://jx.xmflv.cc/?url={url}',
        deletable: false,
      },

      {
        key: 'pyjx',
        name: '剖云解析',
        url: 'https://www.pouyun.com/?url={url}',
        deletable: false,
      },
      {
        key: 'ckjx',
        name: 'CK解析',
        url: 'https://www.ckplayer.vip/jiexi/?url={url}',
        deletable: false,
      },
      {
        key: 'pgjx',
        name: '盘古解析',
        url: 'http://www.pangujiexi.com/jiexi/?url={url}',
        deletable: false,
      },
      {
        key: 'm3u8jx',
        name: 'm3u8解析',
        url: 'http://jx.m3u8.tv/jiexi/?url={url}',
        deletable: false,
      },
    ],
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
