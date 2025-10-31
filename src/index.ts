import {
  ProcessDefinitionData,
  ProcessRequestData,
  StepType,
  UnmeshedClient,
} from "@unmeshed/sdk";

const unmeshedClient = new UnmeshedClient({
  baseUrl: "http://localhost",
  port: 8080,
  authToken: "Il5qC0pE2mxpONTdqTrl",
  clientId: "63e8bb43-812b-4f94-8165-c23f91497e97",
});

let workerFunction = (input) => {
  return new Promise((resolve) => {
    const output = {
      ...(input || {}),
      ranAt: new Date(),
    };
    resolve(output);
  });
};

const processDefinitionData: ProcessDefinitionData = {
  steps: [
    {
      type: StepType.WORKER, // Use the StepType enum (StepType.<type>) to ensure valid step types.
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

const worker = {
  worker: workerFunction,
  namespace: "default",
  name: "worker",
  maxInProgress: 500,
};

unmeshedClient.startPolling([worker]);

const request: ProcessRequestData = {
  namespace: `default`,
  name: `testing`,
  version: null,
  requestId: `my-id-1`,
  correlationId: `my-crid-1`,
  input: {
    mykey: "value",
    mykeyNumber: 100,
    mykeyBoolean: true,
  },
};

const processData = await unmeshedClient.runProcessSync(request);

console.log("Output: ", processData);

const pd = await unmeshedClient.getProcessData(processData.processId, true);

console.log("Output of process including steps ", pd);

const pdWithoutSteps = await unmeshedClient.getProcessData(
  processData.processId,
  false
);

console.log("Output of process without steps ", pdWithoutSteps);

const stepData = await unmeshedClient.getStepData(pd.steps[0].id);

console.log("Output of the first step in process ", stepData);

const processIds = [1, 2, 3];
const reason = "Terminating due to policy changes";
const bulkTerminateOutput = await unmeshedClient.bulkTerminate(
  processIds,
  reason
);

console.log("Output of the bulk terminate action ", bulkTerminateOutput);

const bulkResumeOutput = await unmeshedClient.bulkResume(processIds);
console.log("Output of the bulk resume action ", bulkResumeOutput);

const bulkReviewedOutput = await unmeshedClient.bulkReviewed(
  processIds,
  reason
);
console.log("Output of the bulk resume action ", bulkReviewedOutput);

const rerun = await unmeshedClient.reRun(processData.processId);
console.log("Output of the rerun action ", rerun);
