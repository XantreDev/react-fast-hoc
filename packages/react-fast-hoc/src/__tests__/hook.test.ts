import { cleanup, render, waitFor } from "@testing-library/react";
import { sleep } from "radash";
import { Objects } from "hotscript";
import React, { ComponentType, createElement, forwardRef, memo } from "react";
import { Function } from "ts-toolbelt";
import { afterEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { createTransformProps, transformProps, wrapIntoProxy } from "..";
import { applyHocs, lazyShort, renderComponent } from "./utils";

describe("hooks for transforms should work", () => {
  const A = () => null
  transformProps(A, it => it, {
    hooks: [{
      type: 'first-memo',
      value: () => {}
    }]
  })
})
