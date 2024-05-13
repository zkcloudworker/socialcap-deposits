import "dotenv/config";
import { zkCloudWorkerClient } from "zkcloudworker";
import fs from "fs";

async function main(args: string[]) {
  console.log(`zkCloudWorker Socialcap deposits (c) MAZ 2024 www.zkcloudworker.com`);
  if (!args[0] || !args[1] || !args[2]) {
    console.log(`Use: \n  yarn start payer_address fee amount`);
    process.exit(1);
  }
  console.log(`Payer: ${args[0]} Fee: ${args[1]} Amount: ${args[2]}`);

  const JWT = process.env.JWT as string;

  const api = new zkCloudWorkerClient({
    jwt: JWT,
  });

  const claim = {
    uid: '012345678'
  }

  const response = await api.execute({
    mode: "async",
    repo: "socialcap-deposits",
    developer: "MAZ", // keep it simple, no strange chars here ! 
    task: "create-unsigned-transaction",
    metadata: `Payment for Claim ${claim.uid}`,
    args: JSON.stringify({ 
      chainId: 'devnet' 
    }),
    transactions: [JSON.stringify({
      memo: `Claim ${claim.uid}`.substring(0, 32), // memo field in Txn
      payer: args[0],
      fee: args[1],
      amount: args[2]
    })],
  });

  console.log("API response:", response);
  const jobId = response?.jobId;
  if (jobId === undefined) {
    throw new Error("Job ID is undefined");
  }

  console.log("Waiting for job ...");
  const jobResult = await api.waitForJobResult({ jobId });
  //console.log("Job result:", JSON.stringify(jobResult));
  //console.log("Job result.result:", JSON.stringify(jobResult.result));

  let { result } = jobResult.result;
  let fname = "./tmp/serialized-txn.json";
  console.log("Writing txn to: ", fname);
  console.log("Serialized Txn:", JSON.stringify(result, null, 2));

  fs.writeFileSync(fname, JSON.stringify(JSON.parse(result), null, 2));
}

main(process.argv.slice(2))
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
