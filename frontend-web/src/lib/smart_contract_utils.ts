const RPC_ENDPOINT = 'https://rpc-testnet.supra.com/rpc/v1/view';
const CONTRACT_ADDRESS = '0xa8ec96f327c18b20a4a20ac0f25725527e4686385710aa8a74df7cd75fc3e1e6';

interface InvokeSmartContractArgs {
    function: string;
    type_arguments: any[];
    argument: any[];
}

async function invokeSmartContract(request: InvokeSmartContractArgs) {
    try {
        const response = await fetch(RPC_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error invoking smart contract:', error);
        throw error;
    }
}

function createSmartContractReqArgs(functionName: string, typeArguments: any[] = [], argument: any[] = []): InvokeSmartContractArgs {
    return {
        function: functionName,
        type_arguments: typeArguments,
        argument: argument
    };
}

// Fetch order details
async function getOrderDetails(orderId: number) {
    const functionName = `${CONTRACT_ADDRESS}::smartboxmod::get_order_details`;
    const request = createSmartContractReqArgs(functionName, [], [orderId.toString()]);
    return invokeSmartContract(request);
}

// Fetch user details
async function getUserDetails(userAddress: string) {
    const functionName = `${CONTRACT_ADDRESS}::smartboxmod::get_user`;
    const request = createSmartContractReqArgs(functionName, [], [userAddress]);
    return invokeSmartContract(request);
}

// Fetch all user addresses
async function getUserAddresses() {
    const functionName = `${CONTRACT_ADDRESS}::smartboxmod::get_user_addresses`;
    const request = createSmartContractReqArgs(functionName, [], []);
    return invokeSmartContract(request);
}

// Register a user
async function registerUser(metadata: string, cid: string, rfidData: string, role: number) {
    const functionName = `${CONTRACT_ADDRESS}::smartboxmod::register_user`;
    const request = createSmartContractReqArgs(functionName, [], [metadata, cid, rfidData, role.toString()]);
    return invokeSmartContract(request);
}

// Create a new order
async function createOrder(
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
    deliveryRfid: string
) {
    const functionName = `${CONTRACT_ADDRESS}::smartboxmod::create_order`;
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
    return invokeSmartContract(request);
}

// Mark an order as delivered
async function markAsDelivered(orderId: number) {
    const functionName = `${CONTRACT_ADDRESS}::smartboxmod::mark_as_delivered`;
    const request = createSmartContractReqArgs(functionName, [], [orderId.toString()]);
    return invokeSmartContract(request);
}

// Release funds for an order
async function releaseFunds(orderId: number) {
    const functionName = `${CONTRACT_ADDRESS}::smartboxmod::release_funds`;
    const request = createSmartContractReqArgs(functionName, [], [orderId.toString()]);
    return invokeSmartContract(request);
}

// createOrder('metadata', 'cid', 'name', 'description', 100, 'senderAddress', 'receiverAddress', 37.7749, -122.4194, 'customerRfid', 'deliveryRfid')
