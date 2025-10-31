import {
  ProcessDefinitionData,
  ProcessRequestData,
  StepType,
  UnmeshedClient,
} from "@unmeshed/sdk";

/**
 * Initialize Unmeshed SDK Client
 */
const unmeshedClient = new UnmeshedClient({
  baseUrl: "http://localhost",
  port: 8080,
  authToken: "1erNj3J1zFjTGzTRK1Mh",
  clientId: "30d7334d-dc4e-47df-9b8d-82b547ef8dc5",
});

/**
 * Example worker (custom business logic)
 * - Each step will be executed by this function
 */
const workerFunction = (input: any) => {
  return new Promise((resolve) => {
    const output = {
      ...(input || {}),
      ranAt: new Date(),
    };
    resolve(output);
  });
};

/**
 * Process Definition
 * - Describes workflow
 * - Only one step here: WORKER
 */
const processDefinitionData: ProcessDefinitionData = {
  steps: [
    {
      type: StepType.WORKER,
      name: "worker",
      namespace: "default",
      ref: "worker_1",
      optional: false,
      createdBy: "system",
      updatedBy: "system",
      created: Date.now(),
      updated: Date.now(),
      children: [],
      input: {},
      configuration: {
        rateLimitMaxRequests: null,
        rateLimitWindowSeconds: null,
      },
    },
  ],
  namespace: "default",
  name: "testing",
  version: 1,
  type: "API_ORCHESTRATION",
};

await unmeshedClient.createProcessDefinition(processDefinitionData);

/**
 * Register the worker with the orchestrator
 */
const worker = {
  worker: workerFunction,
  namespace: "default",
  name: "worker",
  maxInProgress: 500,
};

/**
 * Build a process request
 * - You can pass arbitrary input here
 */
const request: ProcessRequestData = {
  namespace: "default",
  name: "testing",
  version: null, // null = run latest
  requestId: "my-id-1",
  correlationId: "my-crid-1",
  input: {
    mykey: "value",
    mykeyNumber: 100,
    mykeyBoolean: true,
  },
};

/**
 * Start polling for tasks (required for worker execution)
 */
unmeshedClient.startPolling([worker]);

/**
 * Run process synchronously
 * - Waits for completion
 */
const processData = await unmeshedClient.runProcessSync(request);
console.log("Output:", processData);

/**
 * Fetch full process details (including step outputs)
 */
const pd = await unmeshedClient.getProcessData(processData.processId, true);
console.log("Process + Steps:", pd);

/**
 * Fetch process details WITHOUT steps
 */
const pdWithoutSteps = await unmeshedClient.getProcessData(
  processData.processId,
  false
);
console.log("Process Only:", pdWithoutSteps);

/**
 * Fetch output of the first step
 */
const stepData = await unmeshedClient.getStepData(pd.steps[0].id);
console.log("First Step Output:", stepData);

/**
 * Bulk operations (Terminate / Resume / Reviewed)
 */
const processIds = [1, 2, 3];
const reason = "Terminating due to policy changes";

// Terminate multiple processes
const bulkTerminateOutput = await unmeshedClient.bulkTerminate(processIds, reason);
console.log("Bulk Terminate:", bulkTerminateOutput);

// Resume multiple processes
const bulkResumeOutput = await unmeshedClient.bulkResume(processIds);
console.log("Bulk Resume:", bulkResumeOutput);

// Mark reviewed
const bulkReviewedOutput = await unmeshedClient.bulkReviewed(processIds, reason);
console.log("Bulk Reviewed:", bulkReviewedOutput);

/**
 * Re-run a process without changing definition
 */
const rerun = await unmeshedClient.reRun(processData.processId);
console.log("Re-run Result:", rerun);
