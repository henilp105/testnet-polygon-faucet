from app import app
from config import db, w3, getbalance, wallet_address, private_key, hCaptchaSecret, fixaddress, gettransactions
from web3 import Web3
from flask import jsonify, request
from web3.gas_strategies.rpc import rpc_gas_price_strategy
from datetime import datetime, timedelta
import requests

max_balance = 5
amount = 0.02
claimTimeout = 43200

params = {"secret": hCaptchaSecret}

headers = {"Content-Type": "application/x-www-form-urlencoded"}


@app.route("/info", methods=["GET", "POST"])
def info():
    ipAddress = request.headers["x-forwarded-for"]
    UA = request.headers["user-agent"]
    language = request.headers["accept-language"]
    platform = request.headers["user-agent"].split("(")[1].split(";")[0]
    createdAt = datetime.now()
    existing_visitor = db.visitors.find({"ipAddress": ipAddress})
    if existing_visitor:
        db.visitors.update_one(
            {"ipAddress": ipAddress},
            {
                "$set": {
                    "UA": {"$addToSet": UA},
                    "language": {"$addToSet": language},
                    "platform": {"$addToSet": platform},
                    "createdAt": {"$addToSet": createdAt},
                }
            },
        )
    else:
        db.visitors.insert_one(
            {
                "ipAddress": ipAddress,
                "UA": {"$addToSet": UA},
                "language": {"$addToSet": language},
                "platform": {"$addToSet": platform},
                "createdAt": {"$addToSet": createdAt},
            }
        )

    return jsonify(
        {
            "faucetBalance": getbalance(wallet_address),
            "claimTimeout": claimTimeout,
            "latest20Transactions": gettransactions(20),
        }
    )


@app.route("/supply/<requestaddress>", methods=["POST"])
def sendtokens(requestaddress):
    ipAddress = request.headers["x-forwarded-for"]
    params["response"] = request.form.get("hCaptchaResponse")
    response = requests.post(
        "https://hcaptcha.com/siteverify", data=params, headers=headers
    )
    success = response.json()["success"]

    if success:
        return jsonify(
            {
                "error": "Internal Server Error",
                "statusCode": 500,
                "message": "hCaptcha failed",
            }
        ),500

    isvalid = fixaddress(requestaddress)

    if isvalid[1] == 1:
        requestaddress = isvalid[0]
    else:
        return jsonify(
            {
                "error": "Internal Server Error",
                "statusCode": 500,
                "message": "Invalid Address",
            }
        ),500

    wallet_exists = db.wallets.find_one(
        {
            "$or": [{"address": requestaddress}, {"ipAddresses": {"$in": [ipAddress]}}],
            "lastClaimed": {"$gte": datetime.now() - timedelta(seconds=claimTimeout)},
        }
    )

    if wallet_exists:
        time_diff = datetime.now() - wallet_exists["lastClaimed"]
        time_in_sec = abs(int(time_diff.total_seconds()))
        message = "You have already claimed in the last 12 hours."
        if time_in_sec > 3600:
            message += f"Please try again in {int(time_in_sec/3600)} hours"

        if time_in_sec % 3600 != 0 and time_in_sec > 3600:
            message += f" and {int((time_in_sec%3600)/60)}."

        if time_in_sec < 3600 and time_in_sec % 3600 != 0:
            message += f"Please try again in {int(time_in_sec/60)}."

        return jsonify(
            {"statusCode": 500, "message": message, "error": "Internal Server Error"}
        ),500

    recipient_balance = getbalance(requestaddress)
    if recipient_balance > max_balance* 100:  #fix this 
        return jsonify(
            {
                "statusCode": 500,
                "message": f"You are way too rich to claim tokens. Your balance is {recipient_balance} MATIC.",
                "error": "Internal Server Error",
            }
        ),500
    w3.eth.set_gas_price_strategy(rpc_gas_price_strategy)
    tx_create = w3.eth.account.sign_transaction(
    {
        'nonce': w3.eth.get_transaction_count(wallet_address),
        'gasPrice': w3.eth.generate_gas_price(),
        'gas': 21000,
        'to': requestaddress,
        'value': w3.to_wei(amount, 'ether'),
    },
    private_key,
    )
    
    transaction = {
    'from': wallet_address,
    'to': requestaddress,
    'value': w3.to_wei(amount, 'ether'),
    'nonce': w3.eth.get_transaction_count(wallet_address),
    'gas': 21000,
    'maxFeePerGas': 2000000000,
    'maxPriorityFeePerGas': 1000000000,
    }

    signed = w3.eth.account.sign_transaction(transaction, private_key)

    # 3. Send the signed transaction
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    tx = w3.eth.get_transaction(tx_hash)
    print(tx)
    try:
        # Send the signed transaction
        tx_hash = w3.eth.send_raw_transaction(tx_create.rawTransaction)

        # Wait for the transaction to be mined and get the receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        txn_hash = tx_receipt.transactionHash.hex()

        print(f"Transaction receipt: {txn_hash}")
    except Exception as e:
        if "insufficient funds" in str(e).lower():
            return jsonify(
                {
                    "statusCode": 500,
                    "message": "Faucet balance is too low, please try again later or consider donating (please!)",
                    "error": "Internal Server Error",
                }
            ),500
        else:
            print(str(e))
            return jsonify(
                {
                    "statusCode": 500,
                    "message": "Internal Server Error",
                    "error": "Internal Server Error",
                }
            ),500

    txn_data = {
        "$set": requestaddress,
        "$addToSet": {"ipAddresses": ipAddress},
        "$push": {"transactionHashes": txn_hash},
        "$inc": {"claimCount": 1},
    }

    db.wallets.update_one({"address": requestaddress}, txn_data, upsert=True)
    txn_doc = {
        "hash": txn_hash,
        "address": requestaddress,
        "amount": amount,
        "createdAt": datetime.now(),
    }

    db.transactions.insert_one(txn_doc)
    return jsonify(txn_doc),200
