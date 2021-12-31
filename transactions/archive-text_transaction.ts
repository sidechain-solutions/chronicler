import { BaseAsset } from 'lisk-sdk';

class ArchiveTextTransaction extends BaseAsset {
  name= "ArchiveTextTransaction";
  id = 101;

  schema = {
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

  static get TYPE() {
    return 101;
  }  

  validate({asset}) {    
    const { title, text } = JSON.parse(asset.data);

    if (!title) {            
      throw new Error('Invalid "title" defined on transaction');      
    }

    if (title.length > 128) {
      throw new Error("A string value no longer than 128 characters");
    }

    if (!text) {      
      throw new Error('Invalid "text" defined on transaction');      
    }

    if (text.length > 20000) {
      throw new Error("A string value no longer than 20000 characters");
    }
  }

  async apply({transaction}) {    
  }

}

module.exports = ArchiveTextTransaction;
