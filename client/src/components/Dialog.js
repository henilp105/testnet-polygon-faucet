import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PolygonLogo from "./PolygonLogo";
// import AccountManager from "./accountManager";
import claimFaucet from "./faucet";
import PolygonScan from "./PolygonScan";
import FormattedDate from "./FormattedDate";
import config from "./config";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Web3Modal, useWeb3Modal } from "@web3modal/react-native";
import { Pressable, Text } from 'react-native';

const accountManager = new AccountManager();

export default function Dialog() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("");
  const [faucetBalance, setFaucetBalance] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [recentTxs, setRecentTxs] = useState([]);
  const [sending, setSending] = useState(false);

  const projectId = "33eb186be6559e79d8c8d26d2d3c6aa0";

  const providerMetadata = {
    name: "Polygon Community run Testnet faucet",
    description: "Polygon Community run Testnet faucet",
    url: "https://testmatic.vercel.app/",
    icons: ["https://testmatic.vercel.app/"],
  };

  const { open, isConnected } = useWeb3Modal();
  const captchaRef = useRef(null);

  const getFaucetInfo = async () => {
    try {
      const {
        data: { latest20Transactions, faucetBalance },
      } = await axios.get(`${config.apiUrl}/info`);
      setFaucetBalance(faucetBalance);
      setTimeout(async () => {
        setRecentTxs(latest20Transactions);
      }, 1000);
    } catch {
      toast.error("Couldn't fetch faucet info");
    }
  };

  const claim = async () => {
    if (!account) return toast.error("Please connect your wallet first");
    try {
      setSending(true);
      const { data } = await claimFaucet(account, captcha);
      setRecentTxs([data, ...(recentTxs || [])]);
      toast.success("Claimed successfully");
    } catch (err) {
      toast.error(err.response?.data.message || "Something went wrong");
      console.log(err);
    } finally {
      setCaptcha("");
      setSending(false);
    }
  };

  useEffect(() => {
    if (!captcha.length) return;
    claim();
  }, [captcha]);

  const connectWallet = () => {
    if (sending) return;
    if (account) {
      if (captchaRef?.current && !captcha) return captchaRef.current.execute();
    }
    accountManager
      .connect()
      .then((account) => {
        if (!account) {
          toast.error(`Make sure you are on the Mumbai Test network!`);
        } else {
          setAccount(account);
          console.log(account);
          accountManager.getBalance().then((balance) => {
            setBalance(balance);
            toast.success(`Connected to ${account.substring(0, 6)}...`);
          });
        }
      })
      .catch((e) => {
        toast.error(`Something wrong happened: ${e.message}`);
      });
  };

  useEffect(() => {
    getFaucetInfo();
  }, []);

  return (
    <>
      <div>
        <h1 className="flex flex-col items-center justify-center px-6 py-2 text-center text-sm font-light">
          <PolygonLogo className="h-14" />
          <span className="-mt-2 mb-8">Community run Testnet faucet</span>
          <code className="text-xs">
            Faucet Balance: {faucetBalance}{" "}
            <span className="text-[#7B3FE4]">MATIC</span>
          </code>
          Replenish ♡
          <div className="max-w-full truncate">
            <PolygonScan address={config.faucetAddress} />
          </div>
        </h1>
        {account && (
          <div className="text-center text-xs">
            Connected as:
            <br />
            <PolygonScan address={account} />
            <div className="mt-1">
              Balance:{" "}
              <code>
                {balance} <span className="text-[#7B3FE4]">MATIC</span>
              </code>
            </div>
          </div>
        )}

        <div className="flex justify-center py-4 pb-6">
          {/* <div
            onClick={() => connectWallet()}
            className={`group relative inline-flex ${
              sending ? 'cursor-not-allowed' : 'cursor-pointer'
            } items-center justify-center overflow-hidden rounded-lg bg-violet-400 px-10 py-4 font-mono font-medium tracking-tighter text-gray-800 dark:bg-gray-800 dark:text-white`}
          >
            <span className="absolute h-0 w-0 rounded-full bg-[#7B3FE4] transition-all duration-500 ease-out group-hover:h-56 group-hover:w-56"></span>
            <span className="absolute inset-0 -mt-1 h-full w-full rounded-lg bg-gradient-to-b from-transparent via-transparent to-gray-700 opacity-30"></span>
            <span className="relative">
              {sending
                ? 'Sending...'
                : account
                ? 'Get Some MATIC!'
                : 'Connect Wallet'}
            </span>
          </div> */}
        </div>
        <HCaptcha
          theme="dark"
          sitekey={config.hCaptchaSiteKey}
          onVerify={setCaptcha}
          ref={captchaRef}
          size="invisible"
        />
        <ul className="scrollbar relative h-24 overflow-y-scroll px-6">
          {recentTxs?.map((tx) => (
            <li
              key={tx.hash}
              className="flex max-w-full justify-around truncate py-1 text-xs"
            >
              <FormattedDate date={tx.createdAt} /> to
              <PolygonScan short address={tx.address} /> tx:
              <PolygonScan short tx={tx.hash} />
            </li>
          ))}
          {recentTxs === null && (
            <div className="flex animate-pulse space-x-4">
              <div className="flex-1 space-y-3 py-1">
                <div className="h-2 rounded bg-slate-700"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-2 rounded bg-slate-700"></div>
                  <div className="col-span-1 h-2 rounded bg-slate-700"></div>
                </div>
                <div className="h-2 rounded bg-slate-700"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 h-2 rounded bg-slate-700"></div>
                  <div className="col-span-2 h-2 rounded bg-slate-700"></div>
                </div>
              </div>
            </div>
          )}
          {recentTxs !== null && recentTxs.length === 0 && (
            <span className="flex h-full w-full items-center justify-center">
              transactions are not monitored, request to use resources
              judiciously.
            </span>
          )}
        </ul>
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-b from-transparent to-white dark:to-slate-900"></div>
      </div>
    </>
  );
}


