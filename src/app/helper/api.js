const { apiClient, codec, cryptography, transactions } = require( '@liskhq/lisk-client');
const fs = require('fs');

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

    async getTransactionsFromPool(){        
        const client = await this.getClient();  
        const schema = await client.invoke('app:getSchema');
        const transactions = await client.invoke('app:getTransactionsFromPool', {});      
        
        var transactionList = [];
        for (var index=0;index< 1;index++)
        {                        
            console.log(transactions.length);
            
            console.log(transactions);

            var transaction = transactions[1];
            var decoded = await codec.codec.decodeJSON(schema.transaction, Buffer.from(transaction, 'hex'));
            console.log("transaction from pool", decoded);
            transactionList.push(transaction);
        };
        return transactionList;
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
    
    async registeredActions(){
        const client = await this.getClient();        
        const registeredActions = await client.invoke('app:getRegisteredActions', {});

        return registeredActions;
    } 

    async createArchiveBinaryAssetAndSign(archive, credential){
        const sender = cryptography.getAddressAndPublicKeyFromPassphrase(credential.passphrase);
        
        var accountNonce = await this.getAccountNonce(sender.address);                
        
        console.log({
            moduleID: 5000,
            assetID: 102,
            nonce: BigInt(accountNonce),
            fee: BigInt(JSON.stringify(archive).length * 10000 * 10),
            senderPublicKey: sender.publicKey,
            asset: {
                data: JSON.stringify(archive),
                recipientAddress: sender.address
            },
        });

        const tx = await transactions.signTransaction(
            archiveBinarySchema,
            {
                moduleID: 5000,
                assetID: 102,
                nonce: BigInt(accountNonce),
                fee: BigInt(Math.round(JSON.stringify(archive).length * 10000 * 5)),
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
                fee: BigInt(JSON.stringify(archive).length * 10000 * 5),
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
            
            var transactionDecoded = codec.codec.decodeJSON(schema.transaction, Buffer.from(transaction.transaction, 'hex'));
            console.log("transaction decoded", transactionDecoded);
        });        
    }

    textToBinary = (str = '') => {
        let res = '';
        res = str.split('').map(char => {
           return char.charCodeAt(0).toString(2); //toString(2) converts to binary format
        }).join(' ');
        return res;
     };
}

function initiateTest(){
    var client = new ApiHelper('ws://api.chronicler.cc:8080/ws');

    var credential = {passphrase: "trip tank female pulp deposit chunk area shop photo hundred brother treat"};

    client.registeredActions().then(function(data){
        console.log(data);
    })

    client.getTransactionsFromPool().then(function(data){
        console.log(data);
    });

    /*client.getAccountFromAddress("608b72e89d6daee341d8926db26936b435cc062d").then(function(data){
        console.log(data);
    });        

    client.getBlockByHeight(1021).then(function(data){
        console.log(data);
    });
    
    var textArchive = {
        "title": "text archive example 1",        
        "text": "A text example to be verified"
    };    
    console.log("text archive length", JSON.stringify(textArchive).length);
    client.createArchiveTextAssetAndSign(textArchive, credential).then(function(response){
        console.log("transaction created", response);

        client.sendTransaction(response).then(function(tx){
            console.log("archive text transaction sent", tx);
        }).catch(function(e){
            console.log("Error sending text archive transaction", e);
        });
    }).catch(function(e){
        console.log("Error creating text archive transaction", e);
    });
    
    var binaryArchive = {
        "title": "text binary example 1",        
        "binary": client.textToBinary("A text example to be verified", "utf8")
    };
    
    console.log("binary archive length", JSON.stringify(binaryArchive).length);
    client.createArchiveBinaryAssetAndSign(binaryArchive, credential).then(function(response){
        console.log("transaction created", response);

        client.sendTransaction(response).then(function(tx){
            console.log("archive binary transaction sent", tx);
        }).catch(function(e){
            console.log("Error sending binary archive transaction", e);
        });
    }).catch(function(e){
        console.log("Error creating binary archive transaction", e);
    });
    

    var file = fs.readFileSync('./utxo.jpg', 'binary');

    var binaryFile = {
        "title": "text binary example 1",        
        "binary": file
    };

    console.log("binary archive length", JSON.stringify(binaryFile).length);
    client.createArchiveBinaryAssetAndSign(binaryFile, credential).then(function(response){
        console.log("transaction created", response);

        client.sendTransaction(response).then(function(tx){
            console.log("archive binary transaction sent", tx);
        }).catch(function(e){
            console.log("Error sending binary archive transaction", e);
        });
    }).catch(function(e){
        console.log("Error creating binary archive transaction", e);
    });
    */
    client.setNewBlockEventSubscriber();

    client.setNewTransactionEventSubscriber();
}

initiateTest();

module.exports = ApiHelper;