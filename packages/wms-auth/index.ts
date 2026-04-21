// Pure evaluation — safe for client-side import (no DB dependency)

export type { BuiltInRole, WmsAction, WmsResource } from "./constants";
// Constants
export {
	BUILT_IN_ROLES,
	WMS_ACTIONS,
	WMS_RESOURCES,
} from "./constants";
export {
	createWmsCanFn,
	evaluate,
	loadPolicyStatements,
	matchAction,
	matchResource,
} from "./evaluator";

// Types
export type { PolicyStatement, WmsCanFn, WmsEffect } from "./types";
