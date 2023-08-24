from app import app
from config import (
    db,
    w3,
    getbalance,
    wallet_address,
    private_key,
    hCaptchaSecret,
    fixaddress,
    gettransactions,
)
from web3 import Web3
from flask import jsonify, request
from web3.gas_strategies.rpc import rpc_gas_price_strategy
from datetime import datetime, timedelta
import requests

max_balance = 5
amount = 0.2
claimTimeout = 43200

params = {"secret": hCaptchaSecret}
# params = {"secret": "0x0000000000000000000000000000000000000000"}

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


def wallet_exists(requestaddress, ipAddress) -> bool:
    requestaddress = requestaddress.lower()
    wallet_exist = db.wallets.find_one(
        {
            "$or": [{"address": requestaddress}, {"ipAddresses": {"$in": [ipAddress]}}],
            "lastClaimed": {"$gte": datetime.now() - timedelta(seconds=claimTimeout)},
        }
    )

    if wallet_exist:
        time_diff = datetime.now() - wallet_exist["lastClaimed"]
        time_in_sec = abs(int(time_diff.total_seconds()))
        message = "You have already claimed in the last 12 hours."
        if time_in_sec >= 3600:
            message += f"Please try again in {int(time_in_sec/3600)} hours"

        if time_in_sec % 3600 != 0 and time_in_sec > 3600:
            message += f" and {int((time_in_sec%3600)/60)} minutes."

        if time_in_sec < 3600:
            message += f"Please try again in {int(time_in_sec/60)} minutes."

        return (True, message)

    return (False, "Wallet does not exist")


def hcaptcha_validate(captcha) -> bool:
    params["response"] = captcha
    response = requests.post(
        "https://hcaptcha.com/siteverify", data=params, headers=headers
    )
    success = response.json()["success"]
    return success


def sendTransaction(requestaddress):
    nonce = w3.eth.get_transaction_count(wallet_address)
    txn = {
        "type": "0x2",
        "nonce": nonce,
        "from": wallet_address,
        "to": requestaddress,
        "value": w3.to_wei(amount, "ether"),
        "maxFeePerGas": w3.to_wei("250", "gwei"),
        "maxPriorityFeePerGas": w3.to_wei("3", "gwei"),
        "chainId": 80001,
    }
    gas = w3.eth.estimate_gas(txn)
    txn["gas"] = gas
    signed_tx = w3.eth.account.sign_transaction(txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return str(w3.to_hex(tx_hash))


@app.route("/supply/<requestaddress>", methods=["POST"])
def sendtokens(requestaddress):
    ipAddress = request.headers["x-forwarded-for"]
    hcaptcha_response = request.json.get("hCaptchaResponse")
    ishcaptchavalid = hcaptcha_validate(hcaptcha_response)

    if not ishcaptchavalid:
        return (
            jsonify(
                {
                    "error": "Internal Server Error",
                    "statusCode": 500,
                    "message": "hCaptcha failed",
                }
            ),
            500,
        )

    isvalid = fixaddress(requestaddress)

    if isvalid[1] == 1:
        requestaddress = isvalid[0]
    else:
        return (
            jsonify(
                {
                    "error": "Internal Server Error",
                    "statusCode": 500,
                    "message": "Invalid Address",
                }
            ),
            500,
        )

    response = wallet_exists(requestaddress, ipAddress)
    recipient_balance = getbalance(requestaddress)

    if response[0]:
        return (
            jsonify(
                {
                    "statusCode": 500,
                    "message": response[1],
                    "error": "Internal Server Error",
                }
            ),
            500,
        )

    if recipient_balance > max_balance:
        return (
            jsonify(
                {
                    "statusCode": 500,
                    "message": f"You are way too rich to claim tokens. Your balance is {recipient_balance} MATIC.",
                    "error": "Internal Server Error",
                }
            ),
            500,
        )

    try:
        txn_hash = sendTransaction(requestaddress)
    except Exception as e:
        if "insufficient funds" in str(e).lower():
            return (
                jsonify(
                    {
                        "statusCode": 500,
                        "message": "Faucet balance is too low, please try again later or consider donating (please!)",
                        "error": "Internal Server Error",
                    }
                ),
                500,
            )
        else:
            print(str(e))
            return (
                jsonify(
                    {
                        "statusCode": 500,
                        "message": "Internal Server Error",
                        "error": "Internal Server Error",
                    }
                ),
                500,
            )

    txn_data = {
        "$set": {"address": requestaddress},
        "$set": {"lastClaimed": datetime.now()},
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
    print(txn_doc)
    return (
        jsonify(
            {
                "hash": str(txn_hash),
                "address": requestaddress,
                "amount": amount,
                "createdAt": datetime.now(),
            }
        ),
        200,
    )
