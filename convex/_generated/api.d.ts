/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as announcements from "../announcements.js";
import type * as employees from "../employees.js";
import type * as holidaySelections from "../holidaySelections.js";
import type * as leaves from "../leaves.js";
import type * as notifications from "../notifications.js";
import type * as referrals from "../referrals.js";
import type * as salaryRecords from "../salaryRecords.js";
import type * as suggestions from "../suggestions.js";
import type * as tickets from "../tickets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  announcements: typeof announcements;
  employees: typeof employees;
  holidaySelections: typeof holidaySelections;
  leaves: typeof leaves;
  notifications: typeof notifications;
  referrals: typeof referrals;
  salaryRecords: typeof salaryRecords;
  suggestions: typeof suggestions;
  tickets: typeof tickets;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
