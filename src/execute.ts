import { zkCloudWorkerClient } from "zkcloudworker";

async function main() {
  console.log(
    `zkCloudWorker Socialcap deposits (c) MAZ 2024 www.zkcloudworker.com\n`
  );
  const JWT =
    process.env.JWT ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NTkwMzQ5NDYiLCJpYXQiOjE3MDEzNTY5NzEsImV4cCI6MTczMjg5Mjk3MX0.r94tKntDvLpPJT2zzEe7HMUcOAQYQu3zWNuyFFiChD0";

  const api = new zkCloudWorkerClient({
    jwt: JWT,
  });

  const response = await api.execute({
    developer: "MAZ",
    repo: "socialcap-deposits",
    transactions: [JSON.stringify({
      memo: "Test deposit",
      payer: "B62qiqEshYFzdAeMWAdfo7ZefJ7cJ6nsv7hUxes13MU5XvFt67WLBoU",
      fee: 2,
      amount: 2
    })],
    task: "generate-proof",
    args: "no-args",
    metadata: `SC deposit`,
    mode: "async",
  });

  console.log("API response:", response);
  const jobId = response?.jobId;
  if (jobId === undefined) {
    throw new Error("Job ID is undefined");
  }

  console.log("Waiting for job ...");
  const result = await api.waitForJobResult({ jobId });
  console.log("Job result:", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
