'use strict';

var PQ = require('pg-promise').ParameterizedQuery;

function DelegatesRepo (db, pgp) {
	this.db = db;
	this.pgp = pgp;
}

var DelegatesSql = {
	countDuplicatedDelegates: 'WITH duplicates AS (SELECT COUNT(1) FROM delegates GROUP BY "transactionId" HAVING COUNT(1) > 1) SELECT count(1) FROM duplicates',

	insertFork: new PQ('INSERT INTO forks_stat ("delegatePublicKey", "blockTimestamp", "blockId", "blockHeight", "previousBlock", "cause") VALUES ($1, $2, $3, $4, $5, $6)'),

	getDelegatesByPublicKeys: 'SELECT ENCODE("publicKey", \'hex\') as "publicKey", username, address FROM mem_accounts WHERE "isDelegate" = 1 AND ENCODE("publicKey", \'hex\') IN ($1:csv) ORDER BY vote ASC, "publicKey" DESC'
};

DelegatesRepo.prototype.countDuplicatedDelegates = function (task) {
	return (task || this.db).query(DelegatesSql.countDuplicatedDelegates);
};

DelegatesRepo.prototype.insertFork = function (fork) {
	return this.db.none(DelegatesSql.insertFork, [fork.delegatePublicKey, fork.blockTimestamp, fork.blockId, fork.blockHeight, fork.previousBlock, fork.cause]);
};

DelegatesRepo.prototype.getDelegatesByPublicKeys = function (publicKeys) {
	return this.db.query(DelegatesSql.getDelegatesByPublicKeys, [publicKeys]);
};

module.exports = DelegatesRepo;
