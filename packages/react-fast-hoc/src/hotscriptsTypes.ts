import type { PartialApply } from "hotscript";
import type { Call2, Fn, unset } from "hotscript/dist/internals/core/Core";
import type {
  Entries,
  FromEntries,
  Assign as ImplAssign,
} from "hotscript/dist/internals/objects/impl/objects";

export declare namespace HotscriptObjects {
  export type Omit<key = unset, obj = unset> = PartialApply<OmitFn, [key, obj]>;
  export interface OmitFn extends Fn {
    return: OmitImpl<this["arg1"], this["arg0"]>;
  }
  export type OmitImpl<obj, keys> = {
    [key in Exclude<keyof obj, keys>]: obj[key];
  };

  /**
   * Merge several objects together
   * @param {...objects} - Objects to merge
   * @returns a merged object
   * @example
   * ```ts
   * type T0 = Call<Objects.Assign<{ a: string }>, { b: number }>; // { a: string, b: number }
   * type T1 = Eval<Objects.Assign<{ a: string }, { b: number }>>; // { a: string, b: number }
   * type T2 = Eval<Objects.Assign<{ a: 1 }, { b: 1 }, { c: 1 }>>; // { a: 1, b: 1, c: 1 }
   * ```
   */
  export type Assign<
    arg1 = unset,
    arg2 = unset,
    arg3 = unset,
    arg4 = unset,
    arg5 = unset
  > = PartialApply<AssignFn, [arg1, arg2, arg3, arg4, arg5]>;
  export interface AssignFn extends Fn {
    return: ImplAssign<this["args"]>;
  }

  /**
   * Only keep keys of an object if the predicate function
   * returns false
   * @param fn - The predicate function, taking (value, key) as arguments
   * @param obj - The object to filter
   * @returns a filtered object
   * @example
   * ```ts
   * type T0 = Call<
   *   Objects.PickBy<Strings.StartsWith<"a">>,
   *   { a: "ab", b: "ac", c: "bc" }
   * >; // { c: "bc" }
   * ```
   */
  export interface OmitBy<fn extends Fn> extends Fn {
    return: OmitByImpl<this["arg0"], fn>;
  }
  type OmitByImpl<T, fn extends Fn> = FromEntries<
    OmitEntriesImpl<Entries<T>, fn>
  >;
  type OmitEntriesImpl<
    entries extends [PropertyKey, any],
    fn extends Fn
  > = entries extends any
    ? Call2<fn, entries[1], entries[0]> extends true
      ? never
      : entries
    : never;
}
