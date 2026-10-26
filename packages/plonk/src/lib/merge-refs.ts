import type { Ref, RefCallback } from "react";

/** Birden çok ref'i tek bir ref callback'inde birleştirir. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(value);
      else if (ref) ref.current = value;
    }
  };
}
