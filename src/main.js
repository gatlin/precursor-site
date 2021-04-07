import App from './App.svelte';
import * as sample_program_source from "./programs.json";
import { CESKM, parse_cbpv, topk } from "precursor-ts";

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

  literal (v) {
    if ("number" === typeof v
     || "boolean" === typeof v
     || null === v)
      { return { v }; }
    throw new Error(`${v} not a primitive value`);
  }

  primop(op_sym, args) {
    switch (op_sym) {
      case "prim:mul": {
        if (! ("v" in args[0]) || ! ("v" in args[1]))
          { throw new Error(`arguments must be values`); }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v)
          { throw new Error(`arguments must be numbers`); }
        let result = args[0].v * args[1].v;
        return { v: result };
      }
      case "prim:add": {
        if (! ("v" in args[0]) || ! ("v" in args[1]))
          { throw new Error(`arguments must be values`); }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v)
          { throw new Error(`arguments must be numbers`); }
        let result = args[0].v + args[1].v;
        return { v: result };
      }
      case "prim:sub": {
        if (! ("v" in args[0]) || ! ("v" in args[1]))
          { throw new Error(`arguments must be values`); }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v)
          { throw new Error(`arguments must be numbers`); }
        let result = args[0].v - args[1].v;
        return { v: result };
      }
      case "prim:eq": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if (("number" !== typeof args[0].v || "number" !== typeof args[1].v)
         && ("boolean" !== typeof args[0].v || "boolean" !== typeof args[1].v) ) {
          throw new Error(`arguments must be numbers or booleans`);
        }
        let result = args[0].v === args[1].v;
        return { v: result };
      }
      case "prim:not": {
        if (! ("v" in args[0])) {
          throw new Error(`argument must be a value`);
        }
        if ("boolean" !== typeof args[0].v) {
          throw new Error(`argument must be a boolean`);
        }
        let result = !args[0].v;
        return { v: result };
      }
      case "prim:lt": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v < args[1].v;
        return { v: result };
      }
      case "prim:lte": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v <= args[1].v;
        return { v: result };
      }
      case "prim:gt": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v > args[1].v;
        return { v: result };
      }
      case "prim:gte": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v >= args[1].v;
        return { v: result };
      }
      case "prim:and": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("boolean" !== typeof args[0].v || "boolean" !== typeof args[1].v) {
          throw new Error(`arguments must be booleans`);
        }
        let result = args[0].v && args[1].v;
        return { v: result };
      }
      case "prim:or": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("boolean" !== typeof args[0].v || "boolean" !== typeof args[1].v) {
          throw new Error(`arguments must be booleans`);
        }
        let result = args[0].v || args[1].v;
        return { v: result };
      }
      default: return super.primop(op_sym, args);
    }
  }
}

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
      if ("v" in res)
        { return JSON.stringify(res.v); }
      else
        { return JSON.stringify(res); }
    }
  }
});

export default app;
