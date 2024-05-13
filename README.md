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

## Run worker test

Run:
```sh
yarn test payer_address fee amount
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

This will start the worker execution. It may take some more time on first execution.

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

#### 5. Full log 

The full log will be something like this:
```
$ yarn test B62qpbqLB1pabZUu4oaDKFmv72DtHWnFxGK8aucNZHxS1cDmmsrrpVp 2 2

zkCloudWorker Socialcap deposits (c) MAZ 2024 www.zkcloudworker.com
Payer: B62qpbqLB1pabZUu4oaDKFmv72DtHWnFxGK8aucNZHxS1cDmmsrrpVp Fee: 2 Amount: 2
API response: {
  success: true,
  jobId: '6459034946.1715597248947.9p4aEl3037z9muMufHMu326nmvjI2U8O',
  result: undefined,
  error: undefined
}
Waiting for job ...
2024-05-13T10:47:29.053Z        INFO    worker {
  command: 'execute',
  id: '6459034946',
  jobId: '6459034946.1715597248947.9p4aEl3037z9muMufHMu326nmvjI2U8O',
  developer: 'MAZ',
  repo: 'socialcap-deposits',
  args: '{"chainId":"devnet"}'
}

2024-05-13T10:47:29.089Z        INFO    zkCloudWorker Execute start: {
  command: 'execute',
  developer: 'MAZ',
  repo: 'socialcap-deposits',
  id: '6459034946',
  jobId: '6459034946.1715597248947.9p4aEl3037z9muMufHMu326nmvjI2U8O',
  job: {
    metadata: 'Payment for Claim 012345678',
    logStreams: [],
    task: 'create-unsigned-transaction',
    maxAttempts: 0,
    args: '{"chainId":"devnet"}',
    timeCreated: 1715597248947,
    timeCreatedString: '2024-05-13T10:47:28.947Z',
    jobId: '6459034946.1715597248947.9p4aEl3037z9muMufHMu326nmvjI2U8O',
    repo: 'socialcap-deposits',
    filename: 'MAZ/execute.1715597248898.json',
    developer: 'MAZ',
    chain: 'devnet',
    txNumber: 1,
    jobStatus: 'created',
    id: '6459034946'
  }
}

2024-05-13T10:47:29.132Z        INFO    execute: number of transactions: 1

2024-05-13T10:47:29.133Z        INFO    RSS memory start: 795 MB, changed by 0 MB

2024-05-13T10:47:29.133Z        INFO    CloudWorker: constructor {
  id: '6459034946',
  jobId: '6459034946.1715597248947.9p4aEl3037z9muMufHMu326nmvjI2U8O',
  developer: 'MAZ',
  repo: 'socialcap-deposits',
  task: 'create-unsigned-transaction',
  taskId: undefined,
  userId: undefined,
  args: '{"chainId":"devnet"}',
  metadata: 'Payment for Claim 012345678',
  cache: '/mnt/efs/cache',
  chain: 'devnet',
  webhook: undefined
}

2024-05-13T10:47:29.156Z        INFO    getWorker result: {
  repo: 'socialcap-deposits',
  size: 32691,
  version: '0.1.3',
  developer: 'MAZ',
  countUsed: 0,
  timeUsed: 0,
  timeDeployed: 1715597229666,
  id: '6459034946',
  protected: false
}

2024-05-13T10:47:29.156Z        INFO    Running worker { developer: 'MAZ', repo: 'socialcap-deposits', version: '0.1.3' }

2024-05-13T10:47:30.955Z        INFO    Task: create-unsigned-transaction

2024-05-13T10:47:30.955Z        INFO    Args: {"chainId":"devnet"}

2024-05-13T10:47:30.955Z        INFO    Payload: {"memo":"Claim 012345678","payer":"B62qpbqLB1pabZUu4oaDKFmv72DtHWnFxGK8aucNZHxS1cDmmsrrpVp","fee":"2","amount":"2"}

2024-05-13T10:47:30.957Z        INFO    Using chain: devnet

2024-05-13T10:47:30.957Z        INFO    Receiving payment: 2 from: B62qpbqLB1pabZUu4oaDKFmv72DtHWnFxGK8aucNZHxS1cDmmsrrpVp for fee:2

2024-05-13T10:47:31.279Z        INFO    Payer account exists

2024-05-13T10:47:31.524Z        INFO    Deposits account exists

2024-05-13T10:47:56.088Z        INFO    Compiled time=24.564secs

2024-05-13T10:47:56.566Z        INFO    Transaction created [
  {
    label: 'feePayer',
    publicKey: '..rpVp',
    fee: '100000000',
    nonce: '23',
    authorization: '..EzRQ'
  },
  {
    label: 'SocialcapDeposits.deposit()',
    publicKey: '..6pSc',
    update: { appState: '["42000000000",null,null,null,null,null,null,null]' },
    balanceChange: { magnitude: '2000000000', sgn: 'Positive' },
    preconditions: {
      account: '{"state":["40000000000",null,null,null,null,null,null,null]}'
    },
    mayUseToken: { parentsOwnToken: false, inheritFromParent: false },
    authorizationKind: {
      isSigned: false,
      isProved: true,
      verificationKeyHash: '4883559220189591104503166840132324201875695539232477762345612025653945031175'
    },
    authorization: undefined
  },
  {
    label: 'SocialcapDeposits.deposit() > AccountUpdate.createSigned()',
    publicKey: '..rpVp',
    callDepth: 1,
    useFullCommitment: true,
    mayUseToken: { parentsOwnToken: false, inheritFromParent: false },
    authorizationKind: { isSigned: true, isProved: false },
    authorization: undefined
  },
  {
    label: 'SocialcapDeposits.deposit() > AccountUpdate.create()',
    publicKey: '..rpVp',
    balanceChange: { magnitude: '2000000000', sgn: 'Negative' },
    callDepth: 1,
    useFullCommitment: true,
    mayUseToken: { parentsOwnToken: false, inheritFromParent: false },
    authorizationKind: { isSigned: true, isProved: false },
    authorization: undefined
  }
]

2024-05-13T10:48:14.648Z        INFO    Unsigned transaction created and proved

2024-05-13T10:48:14.652Z        INFO    RSS memory finished: 1824 MB, changed by 1029 MB

2024-05-13T10:48:14.652Z        INFO    zkCloudWorker Execute Sync: 45.519s

2024-05-13T10:48:14.708Z        INFO    zkCloudWorker Execute: 45.620s

REPORT RequestId: Duration: 45662.21 ms Billed Duration: 45663 ms       Memory Size: 10240 MB   Max Memory Used: 2716 MB

Writing txn to:  ./tmp/serialized-txn.json
Serialized Txn: "{\"feePayer\":{\"body\":{\"publicKey\":\"B62qpbqLB1pabZUu4oaDKFmv72DtHWnFxGK8aucNZHxS1cDmmsrrpVp\",\"fee\":\"100000000\",\"validUntil\":null,\"nonce\":\"23\"},\"authorization\":\"7mWxjLYgbJUkZNcGouvhVj5tJ8yu9hoexb9ntvPK8t5LHqzmrL6QJjjKtf5SgmxB4QWkDw7qoMMbbNGtHVpsbJHPyTy2EzRQ\"},\"accountUpdates\":[{\"body\":{\"publicKey\":\"B62qo6XFLKt7M4TFXTjnEHHvF2UFsq8YfDJiLjX6XbAdfrNZc616pSc\",\"tokenId\":\"wSHV2S4qX9jFsLjQo8r1BsMLH2ZRKsZx6EJd1sbozGPieEC4Jf\",\"update\":{\"appState\":[\"42000000000\",null,null,null,null,null,null,null],\"delegate\":null,\"verificationKey\":null,\"permissions\":null,\"zkappUri\":null,\"tokenSymbol\":null,\"timing\":null,\"votingFor\":null},\"balanceChange\":{\"magnitude\":\"2000000000\",\"sgn\":\"Positive\"},\"incrementNonce\":false,\"events\":[],\"actions\":[],\"callData\":\"25700217346963493267902182509957829914471132526851365529337487520408625460718\",\"callDepth\":0,\"preconditions\":{\"network\":{\"snarkedLedgerHash\":null,\"blockchainLength\":null,\"minWindowDensity\":null,\"totalCurrency\":null,\"globalSlotSinceGenesis\":null,\"stakingEpochData\":{\"ledger\":{\"hash\":null,\"totalCurrency\":null},\"seed\":null,\"startCheckpoint\":null,\"lockCheckpoint\":null,\"epochLength\":null},\"nextEpochData\":{\"ledger\":{\"hash\":null,\"totalCurrency\":null},\"seed\":null,\"startCheckpoint\":null,\"lockCheckpoint\":null,\"epochLength\":null}},\"account\":{\"balance\":null,\"nonce\":null,\"receiptChainHash\":null,\"delegate\":null,\"state\":[\"40000000000\",null,null,null,null,null,null,null],\"actionState\":null,\"provedState\":null,\"isNew\":null},\"validWhile\":null},\"useFullCommitment\":false,\"implicitAccountCreationFee\":false,\"mayUseToken\":{\"parentsOwnToken\":false,\"inheritFromParent\":false},\"authorizationKind\":{\"isSigned\":false,\"isProved\":true,\"verificationKeyHash\":\"4883559220189591104503166840132324201875695539232477762345612025653945031175\"}},\"authorization\":{\"proof\":\"KChzdGF0ZW1lbnQoK...KSkp\",\"signature\":null}},{\"body\":{\"publicKey\":\"B62qpbqLB1pabZUu4oaDKFmv72DtHWnFxGK8aucNZHxS1cDmmsrrpVp\",\"tokenId\":\"wSHV2S4qX9jFsLjQo8r1BsMLH2ZRKsZx6EJd1sbozGPieEC4Jf\",\"update\":{\"appState\":[null,null,null,null,null,null,null,null],\"delegate\":null,\"verificationKey\":null,\"permissions\":null,\"zkappUri\":null,\"tokenSymbol\":null,\"timing\":null,\"votingFor\":null},\"balanceChange\":{\"magnitude\":\"0\",\"sgn\":\"Positive\"},\"incrementNonce\":false,\"events\":[],\"actions\":[],\"callData\":\"0\",\"callDepth\":1,\"preconditions\":{\"network\":{\"snarkedLedgerHash\":null,\"blockchainLength\":null,\"minWindowDensity\":null,\"totalCurrency\":null,\"globalSlotSinceGenesis\":null,\"stakingEpochData\":{\"ledger\":{\"hash\":null,\"totalCurrency\":null},\"seed\":null,\"startCheckpoint\":null,\"lockCheckpoint\":null,\"epochLength\":null},\"nextEpochData\":{\"ledger\":{\"hash\":null,\"totalCurrency\":null},\"seed\":null,\"startCheckpoint\":null,\"lockCheckpoint\":null,\"epochLength\":null}},\"account\":{\"balance\":null,\"nonce\":null,\"receiptChainHash\":null,\"delegate\":null,\"state\":[null,null,null,null,null,null,null,null],\"actionState\":null,\"provedState\":null,\"isNew\":null},\"validWhile\":null},\"useFullCommitment\":true,\"implicitAccountCreationFee\":false,\"mayUseToken\":{\"parentsOwnToken\":false,\"inheritFromParent\":false},\"authorizationKind\":{\"isSigned\":true,\"isProved\":false,\"verificationKeyHash\":\"3392518251768960475377392625298437850623664973002200885669375116181514017494\"}},\"authorization\":{\"proof\":null,\"signature\":null}},{\"body\":{\"publicKey\":\"B62qpbqLB1pabZUu4oaDKFmv72DtHWnFxGK8aucNZHxS1cDmmsrrpVp\",\"tokenId\":\"wSHV2S4qX9jFsLjQo8r1BsMLH2ZRKsZx6EJd1sbozGPieEC4Jf\",\"update\":{\"appState\":[null,null,null,null,null,null,null,null],\"delegate\":null,\"verificationKey\":null,\"permissions\":null,\"zkappUri\":null,\"tokenSymbol\":null,\"timing\":null,\"votingFor\":null},\"balanceChange\":{\"magnitude\":\"2000000000\",\"sgn\":\"Negative\"},\"incrementNonce\":false,\"events\":[],\"actions\":[],\"callData\":\"0\",\"callDepth\":1,\"preconditions\":{\"network\":{\"snarkedLedgerHash\":null,\"blockchainLength\":null,\"minWindowDensity\":null,\"totalCurrency\":null,\"globalSlotSinceGenesis\":null,\"stakingEpochData\":{\"ledger\":{\"hash\":null,\"totalCurrency\":null},\"seed\":null,\"startCheckpoint\":null,\"lockCheckpoint\":null,\"epochLength\":null},\"nextEpochData\":{\"ledger\":{\"hash\":null,\"totalCurrency\":null},\"seed\":null,\"startCheckpoint\":null,\"lockCheckpoint\":null,\"epochLength\":null}},\"account\":{\"balance\":null,\"nonce\":null,\"receiptChainHash\":null,\"delegate\":null,\"state\":[null,null,null,null,null,null,null,null],\"actionState\":null,\"provedState\":null,\"isNew\":null},\"validWhile\":null},\"useFullCommitment\":true,\"implicitAccountCreationFee\":false,\"mayUseToken\":{\"parentsOwnToken\":false,\"inheritFromParent\":false},\"authorizationKind\":{\"isSigned\":true,\"isProved\":false,\"verificationKeyHash\":\"3392518251768960475377392625298437850623664973002200885669375116181514017494\"}},\"authorization\":{\"proof\":null,\"signature\":null}}],\"memo\":\"E4YrhnLeMPQcKG12oG6U1reAFNRFzdKMLRDeVBSftAYAp4nkZEF9D\"}"
```