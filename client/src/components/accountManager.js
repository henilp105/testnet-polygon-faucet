import Web3 from "web3";
// import Web3Modal from "web3modal";
// import WalletConnectProvider from '@walletconnect/web3-provider'
// import { Core } from "@walletconnect/core";
// import { Web3Wallet, IWeb3Wallet } from "@walletconnect/web3wallet";

// import { Pressable, Text } from 'react-native';
// import { Web3Modal, useWeb3Modal } from '@web3modal/react-native';

const projectId = '33eb186be6559e79d8c8d26d2d3c6aa0';

const providerMetadata = {
  name: 'Polygon Community run Testnet faucet',
  description: 'Polygon Community run Testnet faucet',
  url: 'https://testmatic.vercel.app/',
  icons: ['https://testmatic.vercel.app/'],
};

const { open, isConnected } = useWeb3Modal();

class AccountManager {
  connected = false;
  web3Provider = null;
  web3 = null;
  balance = 0;
  network = null;
  account = null;
  formattedBalance = "0.00";
  

//   async connect() {
//     if (!this.connected) {
//       const providerOptions = {
//         walletconnect: {
//           package: WalletConnectProvider,
//           options: {
//             infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
//           },
//           rpc: {
//             80001: "https://rpc-mumbai.maticvigil.com",
//           },
//         },
//       };

//       const web3Modal = new Web3Modal({
//         network: "Mumbai",
//         cacheProvider: true,
//         providerOptions,
//       });

//       this.web3Provider = await web3Modal.connect();
//       try {
//         // Request account access
//         this.account = await this.web3Provider.request({
//           method: "eth_requestAccounts",
//           params: [],
//         });
//       } catch (error) {
//         // User denied account access...
//         throw new Error(`User denied account access: ${error}`);
//       }
//       this.web3 = new Web3(this.web3Provider);
//       this.network = await this.web3.eth.net.getId();
//       if (this.network == MATIC_NETWORK) {
//         this.connected = true;
//         return this.account[0];
//       }
//     }
//   }


  

  getFormattedBalance(balance, decimals) {
    let balance_BN = this.web3.utils.toBN(balance);
    let decimals_BN = this.web3.utils.toBN(10 ** decimals);
    let before_comma = balance_BN.div(decimals_BN).toString();
    let after_comma = balance_BN.mod(decimals_BN).toString();
    after_comma = after_comma.padStart(decimals, "0");
    return before_comma + "." + after_comma.substring(0, 6);
  }

  async getBalance(): Promise<string> {
    const decimals = 18;
    this.balance = await this.web3.eth.getBalance(String(this.account));
    this.formattedBalance = this.getFormattedBalance(this.balance, decimals);
    return this.formattedBalance;
  }
}

export default AccountManager;
