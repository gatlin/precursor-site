import App from './App.svelte';
import * as sample_program_source from "./programs.json";
import { CESKM, parse_cbpv } from "precursor-ts";

class CustomMachine extends CESKM {
  constructor(control) { super(control); }
  primop(op_sym, args) {
    console.log('primop', op_sym);
    switch (op_sym) {
      case 'prim-mod': {
        if ('NumV' === args[0].tag && 'NumV' === args[1].tag) {
          return { tag: 'NumV', v: args[0].v % args[1].v }; }
        break; }
      case 'prim-xor': {
        if ('BoolV' === args[0].tag && 'BoolV' === args[1].tag) {
          return { tag: 'BoolV', v: args[0].v ^ args[1].v }; }
        break; }
      default: return super.primop(op_sym, args); }
    throw new Error(`invalid prim op: ${op_sym}`); } }

const b64_decode = s => Buffer.from(s, 'base64').toString('ascii');
const b64_encode = s => Buffer.from(s).toString('base64');

let sample_programs = sample_program_source['default'].
  map(({ id, text_multiline }) => ({ id, text: text_multiline.join('\n') }));

let preload = null;
let url_hash = window.location.hash.substr(1);
if (undefined !== url_hash && '' !== url_hash) {
  preload = b64_decode(url_hash); }

const app = new App({
  target: document.body,
  props: {
    sample_programs,
    preload,
    b64_encode,
    clear_hash: () => {
      window.location.hash = ''; },
    save_program_to_hash: (value) => {
      window.location.hash = b64_encode(value); },
    parse_cbpv,
    evaluate: (p) => {
      let res = new CustomMachine(p).run();
      if ('tag' in res) {
        switch (res.tag) {
          case 'NumV': return res.v.toString();
          case 'BoolV': return (res.v ? '#t' : '#f');
          case 'ClosureV': {
            let exp = JSON.stringify(res.exp);
            let env = JSON.stringify(res.env);
            return `#<closure:${exp},${env}>`; }
          case 'ContinuationV': {
            switch (res.kont.tag) {
              case 'ArgK': {
                let args = JSON.stringify(res.kont.vs);
                return `#<argk:${args}>`; }
              case 'LetK': {
                let sym = res.kont.sym;
                let exp = JSON.stringify(res.kont.exp);
                let env = JSON.stringify(res.kont.env);
                return `#<letk:${sym},${exp},${env}>`; }
              case 'HaltK': return `#<haltk>`;
              default: throw new Error('illegal continuation value'); } }
          default:
            throw new Error(`illegal machine result :( ${JSON.stringify(res)}`); } }
      else {
        throw new Error(`illegal machine result ${JSON.stringify(res)}`); } } } });

export default app;
