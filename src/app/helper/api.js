const { apiClient, codec, cryptography, transactions } = require( '@liskhq/lisk-client');

var archiveBinarySchema = {
    $id: 'lisk/archivebinary/transaction',
    type: 'object',
    required: ["data"],
    properties: {
        data: {
            dataType: 'string',
            fieldNumber: 1
        }
    }
}

var archiveTextSchema = {
    $id: 'lisk/archivetext/transaction',
    type: 'object',
    required: ["data"],
    properties: {
        data: {
            dataType: 'string',
            fieldNumber: 1
        }
    }
}

const networkIdentifier = "a5f4ae7dd207c8d9767c10ec17544ec46eacd9b351ecbdda5c6e97a0dfc5acd2";

class ApiHelper{
             
    RPC_ENDPOINT;
    constructor (RPC_ENDPOINT){
        this.RPC_ENDPOINT = RPC_ENDPOINT;
    }

    static clientCache;
    async getClient () {
        if (!ApiHelper.clientCache) {            
            ApiHelper.clientCache = await apiClient.createWSClient(this.RPC_ENDPOINT);
        }        
        
        return ApiHelper.clientCache;
    };

    async getAccountFromAddress (address){
        const client = await this.getClient();
        const schema = await client.invoke('app:getSchema');
        const account = await client.invoke('app:getAccount', {
            address,
        });
                
        return codec.codec.decodeJSON(schema.account, Buffer.from(account, 'hex'));
    };    

    async getAccountNonce (address) {
        var account = await this.getAccountFromAddress(address);        
        const sequence = account.sequence;
        return Number(sequence.nonce);
    };

    async getBlockByHeight(height){
        const client = await this.getClient();
        const schema = await client.invoke('app:getSchema');
        const block = await client.invoke('app:getBlockByHeight', {height: height});
                
        return codec.codec.decodeJSON(schema.block, Buffer.from(block, 'hex'));
    }    

    async getConnectedPeers(){
        const client = await this.getClient();        
        const nodeInfo = await client.invoke('app:getConnectedPeers', {});

        return nodeInfo;
    }    
    
    async getCustomTransactionByid(transactionId){        
        const client = await this.getClient();        
        
        return await client.transaction.get(Buffer.from(transactionId, 'hex'));
    }

    async getDisconnectedPeers(){
        const client = await this.getClient();        
        const nodeInfo = await client.invoke('app:getDisconnectedPeers', {});

        return nodeInfo;
    }            

    async getNodeInfo(){
        const client = await this.getClient();        
        const nodeInfo = await client.invoke('app:getNodeInfo', {});

        return nodeInfo;
    }     
    
    async sendTransaction(transaction){
        const client = await this.getClient();        
        const result = await client.transaction.send(transaction);

        return result;
    }
    

    async createArchiveBinaryAssetAndSign(archive, credential){
        const sender = cryptography.getAddressAndPublicKeyFromPassphrase(credential.passphrase);
        
        var accountNonce = await this.getAccountNonce(sender.address);                
        
        const tx = await transactions.signTransaction(
            archiveBinarySchema,
            {
                moduleID: 5000,
                assetID: 102,
                nonce: BigInt(accountNonce),
                fee: BigInt(0),
                senderPublicKey: sender.publicKey,
                asset: {
                    data: JSON.stringify(archive),
                    recipientAddress: sender.address
                },
            },
            Buffer.from(networkIdentifier, "hex"),
            credential.passphrase);
    
        return tx;
    }

    async createArchiveTextAssetAndSign(archive, credential){
        const sender = cryptography.getAddressAndPublicKeyFromPassphrase(credential.passphrase);
        
        var accountNonce = await this.getAccountNonce(sender.address);                
        
        const tx = await transactions.signTransaction(
            archiveTextSchema,
            {
                moduleID: 5000,
                assetID: 101,
                nonce: BigInt(accountNonce),
                fee: BigInt(0),
                senderPublicKey: sender.publicKey,
                asset: {
                    data: JSON.stringify(archive),
                    recipientAddress: sender.address
                },
            },
            Buffer.from(networkIdentifier, "hex"),
            credential.passphrase);
    
        return tx;
    }    

    async setNewBlockEventSubscriber(){      
        const client = await this.getClient();      
        client.subscribe('app:block:new', async ( block ) => {
            const schema = await client.invoke('app:getSchema');
            var blockDecoded = codec.codec.decodeJSON(schema.block, Buffer.from(block.block, 'hex'))
            console.log(blockDecoded);
        });        
    }    

    async setNewTransactionEventSubscriber(){      
        const client = await this.getClient();      
        client.subscribe('app:transaction:new', async ( transaction ) => {
            const schema = await client.invoke('app:getSchema');
            console.log("transaction get", client.transaction.get(Buffer.from(transaction.transaction, 'hex')));
            var transactionDecoded = codec.codec.decodeJSON(schema.transaction, Buffer.from(transaction.transaction, 'hex'));
            console.log("transaction decoded", transactionDecoded);
        });        
    }
}

function initiateTest(){
    var client = new ApiHelper('ws://localhost:8080/ws');
    
    client.getAccountFromAddress("608b72e89d6daee341d8926db26936b435cc062d").then(function(data){
        console.log(data);
    });        

    client.getBlockByHeight(1021).then(function(data){
        console.log(data);
    });
        
    var credential = {passphrase: "there roof brown resemble girl soap pass phone bracket pig dust prefer"};

    var textArchive = {
        "title": "text archive example 1",        
        "text": "A text example to be verified"
    };    

    client.createArchiveTextAssetAndSign(textArchive, credential).then(function(response){
        console.log("transaction created", response);

        client.sendTransaction(response).then(function(tx){
            console.log("archive text transaction sent", tx);
        }).catch(function(e){
            console.log("Error sending news transaction", e);
        });
    }).catch(function(e){
        console.log("Error creating news transaction", e);
    });

    client.setNewBlockEventSubscriber();

    client.setNewTransactionEventSubscriber();
}

initiateTest();

module.exports = ApiHelper;