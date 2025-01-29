import { HexString, SupraAccount, SupraClient } from 'supra-l1-sdk'

const CONTRACT_ADDRESS = '0xa8ec96f327c18b20a4a20ac0f25725527e4686385710aa8a74df7cd75fc3e1e6';
const MODULE_NAME = 'smartboxmod';

let supraClient: SupraClient | null = null

const getWallet = () => {
    if (!('starkey' in window)) {
        window.alert("StarKey Wallet not installed!")
        window.open('https://starkey.app/', '_blank')
        return
    }
    const provider = window.starkey?.supra
    console.log('Wallet provider:', provider)
    return provider;
}

export const connectWallet = async () => {
    const provider = getWallet()
    if (!provider) return
    try {
        const accounts = await provider.connect()
        return accounts
    } catch (error) {
        console.error('Failed to connect to wallet:', error)
    }
}

export const disconnectWallet = async () => {
    const provider = getWallet()
    if (!provider) return
    try {
        await provider.disconnect()
    } catch (error) {
        console.error('Failed to disconnect from wallet:', error)
    }
}

interface InvokeSmartContractArgs {
    function: string;
    type_arguments: any[];
    argument: any[];
}

function createSmartContractReqArgs(functionName: string, typeArguments: any[] = [], argument: any[] = []): InvokeSmartContractArgs {
    return {
        function: functionName,
        type_arguments: typeArguments,
        argument: argument
    };
}

const initSupraClient = async () => {
    if (!supraClient) {
      try {
        supraClient = new SupraClient("https://rpc-testnet.supra.com/");
        console.log('Supra client initialized')
      } catch (error) {
        console.error('Failed to initialize Supra client:', error)
      }
    }
    return supraClient
}

async function invokeSmartContractTransaction(request: InvokeSmartContractArgs, account: string) {
    // Rest API
    // try {
    //     const response = await fetch(RPC_ENDPOINT, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(request)
    //     });
        
    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }

    //     return await response.json();
    // } catch (error) {
    //     console.error('Error invoking smart contract:', error);
    //     throw error;
    // }

    // Supra L1 SDK
    let client = await initSupraClient();
    if(!client) return;
    
    const supraAccount = new SupraAccount(Buffer.from("f557a585127d742b4784bc6a32a9c59b3478d4186e9a6c7a0cbc43a55c793dfb", 'hex'));

    const serializedRawTx = await client.createSerializedRawTxObject(
        supraAccount.address(),               
        (await client.getAccountInfo(supraAccount.address())).sequence_number,     
        CONTRACT_ADDRESS,                     
        MODULE_NAME,                        
        request.function,                     
        request.type_arguments,               
        request.argument            
      );

    console.log("step 3");
    
      const txResult = await client.sendTxUsingSerializedRawTransaction(
        supraAccount,
        serializedRawTx,
        {
            enableWaitForTransaction: true,
            enableTransactionSimulation: false,
        }
      );

    console.log("Transaction result:");
    console.log(txResult);
    
    return;
}
// Fetch order details
export async function getOrderDetails(orderId: number, account: string) {
    const functionName = `get_order_details`;
    const request = createSmartContractReqArgs(functionName, [], [orderId.toString()]);
    return invokeSmartContractTransaction(request, account);
}

// Fetch user details
export async function getUserDetails(userAddress: string, account: string) {
    const functionName = `get_user`;
    const request = createSmartContractReqArgs(functionName, [], [userAddress]);
    return invokeSmartContractTransaction(request, account);
}

// Fetch all user addresses
export async function getUserAddresses(account: string) {
    const functionName = `get_user_addresses`;
    const request = createSmartContractReqArgs(functionName, [], []);
    return invokeSmartContractTransaction(request, account);
}

// Register a user
export async function registerUser(metadata: string, cid: string, rfidData: string, role: number, account: string) {
    const functionName = `register_user`;
    const request = createSmartContractReqArgs(functionName, [], [metadata, cid, rfidData, role.toString()]);
    return invokeSmartContractTransaction(request, account);
}

// Create a new order
export async function createOrder(
    metadata: string,
    cid: string,
    name: string,
    description: string,
    funds: number,
    senderAddress: string,
    receiverAddress: string,
    latitude: number,
    longitude: number,
    customerRfid: string,
    deliveryRfid: string,
    account: string
) {
    const functionName = `create_order`;
    const request = createSmartContractReqArgs(functionName, [], [
        metadata,
        cid,
        name,
        description,
        funds.toString(),
        senderAddress,
        receiverAddress,
        latitude.toString(),
        longitude.toString(),
        customerRfid,
        deliveryRfid
    ]);
    return invokeSmartContractTransaction(request, account);
}

// Mark an order as delivered
export async function markAsDelivered(orderId: number, account: string) {
    const functionName = `mark_as_delivered`;
    const request = createSmartContractReqArgs(functionName, [], [orderId.toString()]);
    return invokeSmartContractTransaction(request, account);
}

// Release funds for an order
export async function releaseFunds(orderId: number, account: string) {
    const functionName = `release_funds`;
    const request = createSmartContractReqArgs(functionName, [], [orderId.toString()]);
    return invokeSmartContractTransaction(request, account);
}

