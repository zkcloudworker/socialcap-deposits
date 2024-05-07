# socialcap-deposits

Submitting deposits (credential fee payments) to the Socialcap account.

The worker will create an unsigned serialized transaction that will later 
be signed and sent using Auro wallet.

## Installation

You need to install `node (v20+)` and `git` and clone this repo

```
git clone https://github.com/zkcloudworker/socialcap-deposits
cd socialcap-deposits
```

## Deploy

Install zkCloudWorker CLI tool
```sh
npm install -g zkcloudworker-cli
```

Deploy this repo to zkCloudWorker cloud. 
```sh
zkcw deploy
```

or, in verbose mode
```sh
zkcw deploy -v
```

**IMPORTANT**: 

- Carefully setup the `name` field  in the `package.json` file. It will 
  became the name of your worker and latter will be needed to start the worker.

- Also set the `author` field  in the `package.json` file.

## Run worker

Run:
```sh
yarn start payer_address fee amount
```

## Using the zkCloudWorker API 

Look the `src/execute.ts` example code.

#### 1. Get the JWT API token

Use this [Telegram bot](https://t.me/minanft_bot?start=auth) to get your API token.

### 2. Connect the API client
```
  import "dotenv/config";
  import { zkCloudWorkerClient } from "zkcloudworker";

  // see the '.env-example'
  const JWT = process.env.JWT;

  const api = new zkCloudWorkerClient({
    jwt: JWT,
  });
```

### 3. Start the worker

This will start the worker excecution. It may take some more time on first execution.

```
  const response = await api.execute({
    mode: "async",
    repo: "socialcap-deposits",
    developer: "MAZ", // keep it simple, no strange chars here ! 
    task: "create-unsigned-transaction",
    metadata: `Payment for Claim ...`,
    args: JSON.stringify({ 
      chainId: 'devnet' 
    }),
    transactions: [JSON.stringify({
      memo: `Claim ...`.substring(0, 32), // memo field in Txn limited to 32 chars
      payer: 'B62q...XX',
      fee: 2,
      amount: 2
    })],
  });

  console.log("API response:", response);
  const jobId = response?.jobId;
  if (jobId === undefined) {
    throw new Error("Job ID is undefined");
  }
```

Params to `api.execute()`:

- `mode`: Default mode is `async`. `sync` is available but limited to just 
      30 secs executing time, so use it for very special cases.
- `repo`: This is the same as the `name` field in your `package.json` file, 
      used to deploy the worker.
- `task`: A free command option that is passed along to the worker. The 
      worker can use it to execute different tasks when called, or just ignore it. 
- `developer`:  This is the same as the `author` field in your `package.json` 
    file. Keep it simple, no strange chars here ! 
- `metadata`: Free metadata info, to be included in the call.
- `args`: A stringified set of optional params that can be used by the worker. 
  Is usually used to pass params that do not change between calls.
- `transactions`: The array of stringified payloads that will be passed to the 
  worker and are needed for execution. It may be empty depending on the 
  worker needs.

#### 4. Wait for the Job to finish

The job may take some time, so we need to wait for it to finish.
```
  console.log("Waiting for job ...");

  const result = await api.waitForJobResult({ jobId });

  console.log("Job result:", result);
```
