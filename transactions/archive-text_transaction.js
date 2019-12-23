const { BaseTransaction, TransactionError } = require("@liskhq/lisk-transactions");

class ArchiveTextTransaction extends BaseTransaction {
  static get TYPE() {
    return 101;
  }

  /* Set the transaction FEE to 10 TOKENS */

  static get FEE() {
    return `${10 * 10 ** 8}`;
  }

  validateAsset() {
    const errors = [];
    const { title, text } = JSON.parse(this.asset.data);

    if (!title) {
      errors.push(
        new TransactionError(
          'Invalid "title" defined on transaction',
          this.id,
          ".asset.data",
          title
        )
      );
    }

    if (title.length > 128) {
      errors.push(new TransactionError("A string value no longer than 128 characters"));
    }

    if (!text) {
      errors.push(
        new TransactionError('Invalid "text" defined on transaction', this.id, ".asset.data", text)
      );
    }

    if (text.length > 20000) {
      errors.push(new TransactionError("A string value no longer than 20000 characters"));
    }

    return errors;
  }

  assetToBytes() {
    const { data } = this.asset;

    return Buffer.from(data, "utf8");
  }

  applyAsset() {
    return [];
  }

  undoAsset() {
    return [];
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

module.exports = ArchiveTextTransaction;
