import React, { useState, useEffect, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import GithubCorner from "./components/GithubCorner";
import PolygonLogo from "./components/PolygonLogo";
import PolygonScan from "./components/PolygonScan";
import getBalance from "./components/getbalance";
import gettxn from "./components/gettransactions";
import config from "./components/config";
import FormattedDate from "./components/FormattedDate";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Button from "react-bootstrap/Button";
import claimFaucet from "./components/faucet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";

function App() {
  const [balance, setBalance] = useState(null);
  const [account, setAccount] = useState("");
  const [recentTxs, setRecentTxs] = useState([]);
  const captchaRef = useRef(null);
  const [captcha, setCaptcha] = useState("");
  const [isSending, setIsSending] = useState(false);
  const toast_css = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  useEffect(() => {
    getBalance()
      .then((acc_balance) => {
        setBalance(acc_balance);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });

    gettxn()
      .then((txn) => {
        setRecentTxs(txn);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }, []);

  useEffect(() => {
    if (captcha !== "" && account !== "") {
      setIsSending(true);
      claimFaucet(account, captcha)
        .then((response) => {
          toast.success("Claimed successfully");
        })
        .catch((error) => {
          console.error("Error:", error.message);
          console.log(error);
          toast.error(error.response.data.message, toast_css);
        });
      setIsSending(false);
    }
  }, [captcha]);

  const onLoad = () => {
    if (account !== "") {
      captchaRef.current.execute();
    }
  };

  return (
    <div style={{ paddingTop: "140px" }}>
      <GithubCorner
        repository={"https://github.com/henilp105/testnet-polygon-faucet/"}
      />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
      />
      <center>
        <main
          className={`flex min-h-screen flex-col items-center justify-center bg-white py-2 dark:bg-slate-900 dark:text-white`}
        >
          THIS IS A TEST NET FAUCET. This Community Run Testnet Faucet by Henil
          Panchal.
          <div>
            All Rate limiting Measures have been disabled , please use faucet
            judiciously.
          </div>
        </main>
        <div>
          <h1
            className="flex flex-col items-center justify-center px-6 py-2 text-center text-sm font-light"
            style={{
              fontSize: "14px",
              fontWeight: "normal",
              textAlign: "center",
            }}
          >
            <PolygonLogo className="h-14" style={{ width: "45px" }} />
            <br />
            <span>Community run Testnet faucet</span>
            <br />
            <code className="text-xs" style={{ fontSize: "14px" }}>
              {balance !== null ? (
                <>Faucet Balance: {balance} </>
              ) : (
                <>Loading balance... </>
              )}
              <span style={{ color: "#7B3FE4" }}>MATIC</span>
              <br />
              <br />
            </code>
            Replenish ♡<br />
            <div className="max-w-full truncate">
              <PolygonScan address={config.faucetAddress} />
            </div>
            <br />
            <input
              type="text"
              className="btn"
              placeholder="Enter your address here"
              style={{ width: "300px" }}
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            ></input>
            <Button type="primary" className="btn" onClick={onLoad}>
              {isSending ? "Sending" : "Send MATIC"}
            </Button>
            <HCaptcha
              sitekey={config.hCaptchaSiteKey}
              onLoad={onLoad}
              onVerify={setCaptcha}
              ref={captchaRef}
              size="invisible"
            />
            <br />
            <br />
            <div className="txn" style={{ fontSize: "12px" }}>
              {recentTxs.length > 0 ? (
                recentTxs.map((txn) => (
                  <p key={txn.hash}>
                    <FormattedDate date={txn.createdAt} />{" "}
                    <span className="data">to:</span>
                    <PolygonScan address={txn.address} short={true} />{" "}
                    <span className="data">tx:</span>
                    <PolygonScan tx={txn.hash} short={true} />
                  </p>
                ))
              ) : (
                <>Loading recent transactions...</>
              )}
            </div>
          </h1>
        </div>
      </center>
    </div>
  );
}

export default App;
