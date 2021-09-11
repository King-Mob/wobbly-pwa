import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import "./index.css";
import Registration from "./components/Registration";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as sdk from "matrix-js-sdk";

global.Olm = require("olm");
const localStorage = global.localStorage;
const {
  LocalStorageCryptoStore,
} = require("matrix-js-sdk/lib/crypto/store/localStorage-crypto-store");

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
let matrixClient;

const trustAllDevices = () => {
  let deviceData = JSON.parse(localStorage.getItem("crypto.device_data"));

  if (deviceData) {
    for (let user in deviceData.devices)
      for (let device in deviceData.devices[user]) {
        deviceData.devices[user][device].known = true;
        deviceData.devices[user][device].verified = 1;
      }

    localStorage.setItem("crypto.device_data", JSON.stringify(deviceData));
  }
};

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/register">
          <Registration localStorage={localStorage} />
        </Route>
        <Route path="/">
          {userInfo ? <p>loading...</p> : <Redirect to="/register" />}
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

const startApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App client={matrixClient} />
    </React.StrictMode>,
    document.getElementById("root")
  );
};

const startMatrix = async (userInfo) => {
  trustAllDevices();

  matrixClient = sdk.createClient({
    userId: userInfo.user_id,
    baseUrl: "https://matrix.org",
    accessToken: userInfo.access_token,
    deviceId: userInfo.device_id,
    crypto: true,
    timelineSupport: true,
    sessionStore: new sdk.WebStorageSessionStore(localStorage),
    cryptoStore: new LocalStorageCryptoStore(localStorage),
  });

  await matrixClient.initCrypto();
  await matrixClient.startClient();

  matrixClient.once("sync", async (state, prevState, res) => {
    // state will be 'PREPARED' when the client is ready to use
    console.log(state);
    startApp();
  });

  const processTimeline = async (event, room) => {
    matrixClient.decryptEventIfNeeded(event, { isRetry: true, emit: true });
  };

  matrixClient.on("Room.timeline", processTimeline);
};

if (userInfo) startMatrix(userInfo);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
