import { Any } from "ts-toolbelt";
// import { Boolean } from "./Boolean/_Internal";

/**
 * Test should pass
 */
export type Pass = 1;

/**
 * Test should fail
 */
export type Fail = 0;
type Boolean = Pass | Fail;

/**
 * Check or test the validity of a type
 * @param debug to debug with parameter hints (`ctrl+p`, `ctrl+shift+space`)
 * @example
 * ```ts
 * // see in `tst` folder
 * ```
 */
export declare function check<Type, Expect, Outcome extends Boolean>(
  debug?: Type
): Any.Equals<Any.Equals<Type, Expect>, Outcome>;

/**
 * Validates a batch of [[check]]
 * @param checks a batch of [[check]]
 * @example
 * ```ts
 * // see in `tst` folder
 * ```
 */
export declare function checks(checks: Pass[]): void;
