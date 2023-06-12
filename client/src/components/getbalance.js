import axios from "axios";
import config from "./config";

async function getBalance() {
  let apiUrl = `${config.apiUrl}/info`;
  var t = await axios.get(apiUrl);
  return t.data.faucetBalance;
}

export default getBalance;