import App from './App.svelte';
import * as sample_program_source from "./programs.json";
import { CESKM, parse_cbpv, haltk } from "precursor-ts";

const clone = (a) => JSON.parse(JSON.stringify(a));

class DemoMachine extends CESKM {
  get_result () { return this.result; }

  * run_generator() {
    let st = this.make_initial_state();
    while (!this.result) {
      let res = this.step(clone(st));
      if (!this.result) {
        st = res;
        yield st; } } }

  primop(op_sym, args) {
    switch (op_sym) {
      case 'prim:mod': {
        if ('number' === args[0].tag && 'number' === args[1].tag) {
          return { tag: 'number', v: args[0].v % args[1].v }; }
        break; }
      case 'prim:xor': {
        if ('boolean' === args[0].tag && 'boolean' === args[1].tag) {
          return { tag: 'boolean', v: args[0].v ^ args[1].v }; }
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
    clear_hash: () => {
      window.location.hash = ""; },
    save_program_to_hash: (value) => {
      window.location.hash = b64_encode(value); },
    parse: (source) => {
      let parsed = parse_cbpv(source);
      console.log("parsed", parsed);
      return parsed;
    },
    evaluate: (p) => {
      let m = new DemoMachine(p);
      for (let st of m.run_generator()) {
        console.log(st);
      }
      let res = m.get_result();
      console.log("res", res);
      if ("tag" in res) {
        switch (res.tag) {
          case "number": return res.v.toString();
          case "boolean": return (res.v ? "#t" : "#f");
          case "string": return res.v;
          case "record":
          case "array":
            return JSON.stringify(res.v);
          case "closure": {
            let exp = JSON.stringify(res.exp);
            let env = JSON.stringify(res.env);
            return `#<closure:${exp},${env}>`; }
          case "continuation": {
            switch (res.kont.tag) {
              case "arg": {
                let args = JSON.stringify(res.kont.vs);
                return `#<argk:${args}>`; }
              case "let": {
                let sym = res.kont.sym;
                let exp = JSON.stringify(res.kont.exp);
                let env = JSON.stringify(res.kont.env);
                return `#<letk:${sym},${exp},${env}>`; }
              case "top": return `#<haltk>`;
              default: throw new Error('illegal continuation value'); } }
          default:
            throw new Error(`illegal machine result :( ${JSON.stringify(res)}`); } }
      else {
        throw new Error(`illegal machine result ${JSON.stringify(res)}`); } } } });

export default app;
