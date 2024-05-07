import { UInt64, PublicKey, Mina, fetchAccount } from "o1js";
import { zkCloudWorker, Cloud } from "zkcloudworker";
import { SocialcapDeposits } from "./contract";

const MINA = 1e9;
const TXN_FEE = 100_000_000;
const DEPOSIT_ADDRESS="B62qo6XFLKt7M4TFXTjnEHHvF2UFsq8YfDJiLjX6XbAdfrNZc616pSc";

interface Payload {
  memo: string,
  payer: string;
  amount: number;
  fee: number;
};

let VerificationKey: any | null = null;


function getPayload(transactions: string[]): Payload {
  if (!transactions || !transactions.length) 
    throw Error("No payload received.")      
  try { 
    let payload = JSON.parse(transactions[0]); 
    return payload;
  }
  catch(error) { 
    throw Error ("Could not parse received transaction.") 
  }
}

async function isCompiled(vk: any | null): Promise<any | null> {
  if (!vk) {
    // TODO: use cache !
    try {
      let t0 = Date.now()
      const compiled = await SocialcapDeposits.compile();
      vk = compiled.verificationKey;
      let dt = (Date.now() - t0)/1000;
      console.log(`Compiled time=${dt}secs`);
      return vk;
    }
    catch (err) {
      throw Error("Unable to compile SocialcapDeposits contract");
    }
  }
  return vk;
}


export class DepositsWorker extends zkCloudWorker {

  constructor(cloud: Cloud) {
    super(cloud);
  }

  public async execute(transactions: string[]): Promise<string | undefined> {
    console.log(`Args: ${this.cloud.args}`)
    console.log(`Payload: ${transactions[0]}`);
    
    let { memo, payer, amount, fee } = getPayload(transactions);
    console.log(`Receiving payment: ${amount} from: ${payer} for fee:${fee}`);
    
    let payerPublicKey = PublicKey.fromBase58(payer);
    let payerExists = await fetchAccount({ publicKey: payerPublicKey });
    if (!payerExists) throw Error("Fee payer account does not exist");
    console.log(`Payer account exists`);
    
    let pubkey = PublicKey.fromBase58(DEPOSIT_ADDRESS); 
    let account = await fetchAccount({ publicKey:  pubkey });
    if (!account) throw Error("Deposits account does not exist");
    console.log(`Deposits account exists`);
    
    VerificationKey = await isCompiled(VerificationKey);

    let zkApp = new SocialcapDeposits(pubkey);
  
    const txn = await Mina.transaction({ 
        sender: payerPublicKey, 
        fee: TXN_FEE, 
        memo: (memo || "").substring(0,32) 
      }, 
      async () => {
        await zkApp.deposit(
          UInt64.from(BigInt(amount*MINA)), 
          UInt64.from(BigInt(fee*MINA))
        );
      }
    );
    console.log(`Transaction created`, txn.toPretty());

    let unsignedTxn = await txn.prove();
    console.log(`Unsigned transaction created and proved`);

    // return the serialized unsigned transaction
    return JSON.stringify(unsignedTxn.toJSON(), null, 2);
  }
}
