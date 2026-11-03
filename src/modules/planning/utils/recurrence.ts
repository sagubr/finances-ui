export const resolveRecurringTimezone = (
  ruleTimezone: string | undefined,
  workspaceTimezone: string,
) => ruleTimezone ?? workspaceTimezone
