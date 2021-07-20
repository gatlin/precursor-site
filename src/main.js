import App from './App.svelte';
import * as sample_program_source from "./programs.json";
import { CESKM, parse_cbpv, topk, scalar } from "precursor-ts";

const clone = (a) => JSON.parse(JSON.stringify(a));

class DemoMachine extends CESKM {
  get_result () { return this.result; }

  * run_generator(program) {
    let st = this.make_initial_state(parse_cbpv(program));
    let iter = this.step(st);
    while (!iter.done) {
      st = iter.value;
      yield st;
      iter = this.step(st);
    }}

  literal (v) {
    if ("number" === typeof v
     || "boolean" === typeof v
     || "string" === typeof v
     || null === v)
      { return { v }; }
    throw new Error(`${v} not a primitive value`);
  }

  op(op_sym, args) {
    switch (op_sym) {
      case "op:mul": {
        if (! ("v" in args[0]) || ! ("v" in args[1]))
          { throw new Error(`arguments must be values`); }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v)
          { throw new Error(`arguments must be numbers`); }
        let result = args[0].v * args[1].v;
        return { v: result };
      }

      case "op:div": {
        if (! ("v" in args[0]) || ! ("v" in args[1]))
        { throw new Error(`arguments must be values`); }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v)
        { throw new Error(`arguments must be numbers`); }
        let result = args[0].v / args[1].v;
        return { v: result };
      }

      case "op:add": {
        if (! ("v" in args[0]) || ! ("v" in args[1]))
          { throw new Error(`arguments must be values`); }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v)
          { throw new Error(`arguments must be numbers`); }
        let result = args[0].v + args[1].v;
        return { v: result };
      }
      case "op:sub": {
        if (! ("v" in args[0]) || ! ("v" in args[1]))
          { throw new Error(`arguments must be values`); }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v)
          { throw new Error(`arguments must be numbers`); }
        let result = args[0].v - args[1].v;
        return { v: result };
      }
      case "op:eq": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if (("number" !== typeof args[0].v || "number" !== typeof args[1].v)
            && ("boolean" !== typeof args[0].v || "boolean" !== typeof args[1].v)
            && ("string" !== typeof args[0].v || "string" !== typeof args[1].v)
           ) {
          throw new Error(`arguments must be numbers or booleans`);
        }
        let result = args[0].v === args[1].v;
        return { v: result };
      }
      case "op:not": {
        if (! ("v" in args[0])) {
          throw new Error(`argument must be a value`);
        }
        if ("boolean" !== typeof args[0].v) {
          throw new Error(`argument must be a boolean`);
        }
        let result = !args[0].v;
        return { v: result };
      }
      case "op:lt": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v < args[1].v;
        return { v: result };
      }
      case "op:lte": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v <= args[1].v;
        return { v: result };
      }
      case "op:gt": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v > args[1].v;
        return { v: result };
      }
      case "op:gte": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("number" !== typeof args[0].v || "number" !== typeof args[1].v) {
          throw new Error(`arguments must be numbers`);
        }
        let result = args[0].v >= args[1].v;
        return { v: result };
      }
      case "op:and": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("boolean" !== typeof args[0].v || "boolean" !== typeof args[1].v) {
          throw new Error(`arguments must be booleans`);
        }
        let result = args[0].v && args[1].v;
        return { v: result };
      }
      case "op:or": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("boolean" !== typeof args[0].v || "boolean" !== typeof args[1].v) {
          throw new Error(`arguments must be booleans`);
        }
        let result = args[0].v || args[1].v;
        return { v: result };
      }
     case "op:concat": {
        if (! ("v" in args[0]) || ! ("v" in args[1])) {
          throw new Error(`arguments must be values`);
        }
        if ("string" !== typeof args[0].v || "string" !== typeof args[1].v) {
          throw new Error(`arguments must be strings`);
        }
        const result = args[0].v.concat(args[1].v);
        return scalar(result);
      }
      case "op:strlen": {
        if (! ("v" in args[0])) {
          throw new Error(`argument must be a value`);
        }
        if ("string" !== typeof args[0].v) {
          throw new Error(`argument must be a string`);
        }
        const result = args[0].v.length;
        return scalar(result);
      }
      case "op:substr": {
        if (! ("v" in args[0]) || ! ("v" in args[1]) || ! ("v" in args[2])) {
          throw new Error(`arguments must be values`);
        }
        if ("string" !== typeof args[0].v || "number" !== typeof args[1].v
           || "number" !== typeof args[2].v) {
          throw new Error(`arguments must be strings`);
        }
        const result = args[0].v.slice(args[1].v,args[2].v);
        return scalar(result);
      }
      case "op:str->num": {
        if (! ("v" in args[0])) {
          throw new Error(`argument must be a value`);
        }
        if ("string" !== typeof args[0].v) {
          throw new Error(`argument must be a string: ${args[0].v}`);
        }
        return scalar(parseInt(args[0].v));
      }
      case "op:num->str": {
        if (! ("v" in args[0])) {
          throw new Error(`argument must be a value`);
        }
        if ("number" !== typeof args[0].v) {
          throw new Error(`argument must be a number: ${args[0].v}`);
        }
        return scalar((args[0].v).toString());
      }

      default: return super.op(op_sym, args);
    }
  }
}

const b64_decode = s => Buffer.from(s, 'base64').toString('ascii');
const b64_encode = s => Buffer.from(s).toString('base64');

let sample_programs = sample_program_source['default'].
  map(({ id, text_multiline, byline }) => ({ id, text: text_multiline.join('\n'), byline }));

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
      let m = new DemoMachine();
      for (let st of m.run_generator(p)) {
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
