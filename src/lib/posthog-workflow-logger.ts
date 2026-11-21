import posthog from "posthog-js";

type WorkflowLogAttributes = Record<string, boolean | number | string>;

export const posthogWorkflowLogger = {
  info(message: string, attributes?: WorkflowLogAttributes) {
    posthog.logger.info(message, attributes);
  },
};
