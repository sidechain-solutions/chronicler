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

  /* Set the transaction FEE to 100 TOKENS */

  static get FEE() {
    return `${100 * 10 ** 8}`;
  }

  validate({asset}) {
    const errors = [];
    const { title, binary } = JSON.parse(asset.data);

    if (!title) {
      errors.push(
        new Error(
          'Invalid "title" defined on transaction'
        )
      );
    }

    if (title.length > 128) {
      errors.push(new Error("A string value no longer than 128 characters"));
    }

    if (!binary) {
      errors.push(
        new Error(
          'Invalid "binary" defined on transaction',          
        )
      );
    }

    if (binary.length > 1500000) {
      errors.push(new Error("Binary file too large."));
    }

    var result = "";
    errors.forEach(element => {
      result += element.toString();
    });
    throw new Error(result);
  }

  assetToBytes(asset) {
    const { data } = asset;

    return Buffer.from(data, "utf8");
  }

  async apply({transaction}) {    
  }

  assetFromSync(raw) {
    if (raw.tf_data) {
      // This line will throw if there is an error
      const data = raw.tf_data.toString("utf8");

      return { data };
    }

    return undefined;
  }
}

module.exports = ArchiveBinaryTransaction;
