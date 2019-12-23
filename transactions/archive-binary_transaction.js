const { BaseTransaction, TransactionError } = require("@liskhq/lisk-transactions");

class ArchiveBinaryTransaction extends BaseTransaction {
  static get TYPE() {
    return 102;
  }

  /* Set the transaction FEE to 100 TOKENS */

  static get FEE() {
    return `${100 * 10 ** 8}`;
  }

  validateAsset() {
    const errors = [];
    const { title, binary } = JSON.parse(this.asset.data);

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

    if (!binary) {
      errors.push(
        new TransactionError(
          'Invalid "binary" defined on transaction',
          this.id,
          ".asset.data",
          binary
        )
      );
    }

    if (binary.length > 1500000) {
      errors.push(new TransactionError("Binary file too large."));
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

module.exports = ArchiveBinaryTransaction;
