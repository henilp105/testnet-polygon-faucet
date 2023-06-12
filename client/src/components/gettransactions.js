import axios from "axios";
import config from "./config";

async function gettxn() {
  let apiUrl = `${config.apiUrl}/info`;
  var t = await axios.get(apiUrl);
  return t.data.latest20Transactions;
}

export default gettxn;