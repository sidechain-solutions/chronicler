import { BaseAsset } from 'lisk-sdk';

class ArchiveBinaryTransaction extends BaseAsset {
  name="ArchiveBinaryTransaction";
  id = 102;

  schema = {
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

  static get TYPE() {
    return 102;
  }

  validate({asset}) {    
    const { title, binary } = JSON.parse(asset.data);

    if (!title) {      
        throw new Error('Invalid "title" defined on transaction');      
    }

    if (title.length > 128) {
      throw new Error("A string value no longer than 128 characters");
    }

    if (!binary) {
      throw new Error('Invalid "binary" defined on transaction');      
    }

    if (binary.length > 1500000) {
      throw new Error("Binary file too large.");
    }    
  }

  async apply({transaction}) {    
  }

}

module.exports = ArchiveBinaryTransaction;
