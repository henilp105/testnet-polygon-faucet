import os
from pymongo import MongoClient
from dotenv import load_dotenv
from web3 import Web3
from typing import List,Dict,Tuple
import re

load_dotenv()

try:
  database_name = os.environ['MONGO_DB_NAME']
  mongo_uri = os.environ['MONGO_URI']
  mongo_username = os.environ['MONGO_USER_NAME']
  mongo_password = os.environ['MONGO_PASSWORD']
  wallet_address = os.environ['WALLET_ADDRESS']
  private_key = os.environ['PRIVATE_KEY']
  hCaptchaSecret = os.environ['hCaptchaSecret']
  rpc = os.environ['RPC']
  client = MongoClient(mongo_uri)
except KeyError as err:
  print("Key not found in .env")

db = client[database_name]
w3 = Web3(Web3.HTTPProvider(rpc))

def fixaddress(address: str) -> Tuple[str,int]:
  address = address.lower()
  address = address.replace(" ","")
  pattern = r'^(0x)?[0-9a-fA-F]{40}$'
  isvalid =  bool(re.match(pattern, address))
  address = Web3.to_checksum_address(address)
  if isvalid:
    return (address, 1)
  return ("Invalid",0)


def getbalance(address: str) -> float:
  balance_wei = w3.eth.get_balance(address)
  balance = w3.from_wei(balance_wei, 'ether')
  return balance

def gettransactions(txns: int) -> List[Dict]:
  latestTransactions = list(db.transactions.find({}, {'_id': 0}).sort('createdAt', -1).limit(txns))
  return latestTransactions