// const proto = require("@cosmjs/proto-signing");
// const stargate = require("@cosmjs/stargate");

// const mnemonic = "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put";
const rpcEndpoint = "https://rpc.cosmos.network";
// // const rpcEndpoint = "https://localhost:26657";

const chainId = "cosmoshub-4";

import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

// async function getWallet(mnemonic) {
//     return await proto.DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
// }

// const fetch = require("node-fetch");
import fetch from "node-fetch";
// const bip39 = require("bip39");
// const bip32 = require("bip32");
// const ecc = require("tiny-secp256k1"); 
import * as bech32 from "bech32";
import * as bip32 from "bip32";
import * as bip39 from "bip39";

// let BIP32Factory = require('bip32').default
// const bip32 = BIP32Factory(ecc)

// const secp256k1 = require("secp256k1");
import secp256k1 from "secp256k1";
import { decode } from "bech32";

// import('tiny-secp256k1')
//     .then(ecc => BIP32Factory(ecc))
//     .then(bip32 => {
//   let node = bip32.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi')
//   let child = node.derivePath('m/0/0')

// })

console.log("START")

class Cosmos {
    constructor(url, chainId) {
		this.url = url;
		this.chainId = chainId;
		this.path = "m/44'/118'/0'/0/0";
		this.bech32MainPrefix = "cosmos";
	}

    getRandomMnemonic(strength = 256) {
        return bip39.generateMnemonic(strength);
    }

	getECPairPriv(mnemonic) {
		if (typeof mnemonic !== "string") {
		    throw new Error("mnemonic expects a string")
		}
		const seed = bip39.mnemonicToSeed(mnemonic);
        // bip39.mnemonicToSeed(mnemonic)
        //     .then((seed) => {
        //         console.log(seed);
        //     })
		const node = bip32.fromSeed(seed);
        // const node = bip32.fromBase58(seed);

		const child = node.derivePath(this.path);
		return child.privateKey;
	}

	getPubKey(privKey) {
		const pubKeyByte = secp256k1.publicKeyCreate(privKey);
		return pubKeyByte;
	}

	// getPubKeyAny(privKey) {
	// 	const pubKeyByte = secp256k1.publicKeyCreate(privKey);
	// 	var buf1 = new Buffer.from([10]);
	// 	var buf2 = new Buffer.from([pubKeyByte.length]);
	// 	var buf3 = new Buffer.from(pubKeyByte);
	// 	const pubKey = Buffer.concat([buf1, buf2, buf3]);
	// 	const pubKeyAny = new message.google.protobuf.Any({
	// 		type_url: "/cosmos.crypto.secp256k1.PubKey",
	// 		value: pubKey
	// 	});
	// 	return pubKeyAny;
	// }

    	
	getAccounts(address) {
        // api 호출 주소 문제 확인 필요
		// let accountsApi = "/cosmos/auth/v1beta1/accounts/";
        let accountsApi = "/cosmos/auth/v1beta1/query.proto/";
        console.log(this.url + accountsApi + address);
		return fetch(this.url + accountsApi + address).then(response => response.json())
	}

	getAddress(mnemonic, checkSum = true) {
		if (typeof mnemonic !== "string") {
		    throw new Error("mnemonic expects a string")
		}
		if (checkSum) {
			if (!bip39.validateMnemonic(mnemonic)) throw new Error("mnemonic phrases have invalid checksums");
		}
		const seed = bip39.mnemonicToSeed(mnemonic);
		const node = bip32.fromSeed(seed)
		const child = node.derivePath(this.path)
		const words = bech32.toWords(child.identifier);
		return bech32.encode(this.bech32MainPrefix, words);
	}

    getBlock(height) {
        let accountsApi = "/block?height=";
        console.log(this.url + accountsApi + height);
		return fetch(this.url + accountsApi + height).then(response => response.json())
    }

    getTransactionsFromBlock(block) {
        return block.result.block.data.txs
    }
}

const cosmos = new Cosmos(rpcEndpoint, chainId);


const mnemonic = cosmos.getRandomMnemonic()

const address = cosmos.getAddress(mnemonic)
console.log("Address")
console.log(address);

const privKey = cosmos.getECPairPriv(mnemonic);
console.log(privKey);

const pubKeyAny = cosmos.getPubKey(privKey);
console.log(pubKeyAny);


const tmClient = await Tendermint34Client.connect(rpcEndpoint) // your rpc endpoint
// const resp = await tmClient.tx({ hash: txHash})
// console.log(resp.tx)

cosmos.getBlock(10443553)
    .then( block => {
        return cosmos.getTransactionsFromBlock(block)
    })
    .then(txs => {
        let tx = txs[0]
        tmClient.tx({ hash: "0x22B94E4DA4FD12B89487E7941DEECF5A3A4805544E3241110D75BD383F8C396C"})
        .then((tm) => {
            console.log(tm)
        })
        
        // console.log(decodeResult)
    })

const myAccount = "cosmos15d2zt4923lh2ed9zem4su7nmwfm3py9grt3w0u";
// cosmos.getAccounts(myAccount).then(data => {
//     console.log(data);
// })
