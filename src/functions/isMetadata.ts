import { isPlainObject } from "./isPlainObject";

/** Check that the item metadata is in the correct format */
export function isMetadata(
    metadata: unknown
  ): metadata is { order: number; active: boolean, maxActions: number, actionsLeft: number } {
    return (
      isPlainObject(metadata) &&
      typeof metadata.order === "number" &&
      typeof metadata.active === "boolean" &&
      typeof metadata.maxActions === "number" &&
      typeof metadata.actionsLeft === "number"
    );
  }