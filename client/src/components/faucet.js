import axios from 'axios'
import config from './config'

async function claimFaucet(account, captcha) {
  let apiUrl = `${config.apiUrl}/supply/${account}`;
  return await axios
    .post(apiUrl, {
      hCaptchaResponse: captcha,
    })
}

export default claimFaucet;
