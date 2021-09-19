import { useState } from "react";
import Loading from "./Loading";
import ReCAPTCHA from "react-google-recaptcha";

const checkAvailable = async (userName) => {
  const response = await fetch(
    `https://matrix.org/_matrix/client/r0/register/available?username=${userName}`
  );
  return await response.json();
};

const registerStart = async () => {
  const request = {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(
    "https://matrix.org/_matrix/client/r0/register",
    request
  );

  const result = await response.json();
  console.log(result);
  return result;
};

const registerTerms = async (sessionId) => {
  const request = {
    method: "POST",
    body: JSON.stringify({
      auth: {
        session: sessionId,
        type: "m.login.terms",
        policies: {
          privacy_policy: {
            version: "1.0",
            en: {
              name: "Terms and Conditions",
              url: "https://matrix-client.matrix.org/_matrix/consent?v=1.0",
            },
          },
        },
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(
    "https://matrix.org/_matrix/client/r0/register",
    request
  );

  const result = await response.json();
  console.log(result);
  return result;
};

const registerCaptcha = async (sessionId, value) => {
  const request = {
    method: "POST",
    body: JSON.stringify({
      auth: {
        session: sessionId,
        type: "m.login.recaptcha",
        response: value,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(
    "https://matrix.org/_matrix/client/r0/register",
    request
  );

  const result = await response.json();
  console.log(result);
  return result;
};

const requestEmailToken = async (email, clientSecret) => {
  const request = {
    method: "POST",
    body: JSON.stringify({
      client_secret: clientSecret,
      email: email,
      send_attempt: 1,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(
    "https://matrix.org/_matrix/client/r0/register/email/requestToken",
    request
  );

  return await response.json();
};

const registerEmail = async (sessionId, clientSecret, sid, username) => {
  const request = {
    method: "POST",
    body: JSON.stringify({
      auth: {
        session: sessionId,
        type: "m.login.email.identity",
        threepid_creds: {
          email: true,
          client_secret: clientSecret,
          sid: sid,
        },
      },
      device_id: "WBAPUL",
      initial_device_display_name: "wobbly web app",
      password: "arebananaselectric",
      username: username,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(
    "https://matrix.org/_matrix/client/r0/register",
    request
  );

  const result = await response.json();

  return result;
};

const Registration = ({ localStorage }) => {
  const [regStage, setRegStage] = useState("username");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [captchaValue, setCaptchaValue] = useState();
  const [agree, setAgree] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState();
  const [clientSecret, setClientSecret] = useState();
  const [sid, setSid] = useState();

  const register = async () => {
    setError("");

    if (userName.length > 0 && email.length > 0 && agree && captchaValue) {
      const result = await checkAvailable(userName);
      if (!result.available) {
        setError(result.error);
        setRegStage("username");
      } else {
        setRegStage("username-waiting");
        console.log(userName + " is available");

        let numberArray = new Uint32Array(10);
        window.crypto.getRandomValues(numberArray);

        let clientSecret = "";
        numberArray.forEach((n) => {
          clientSecret += n;
        });

        setClientSecret(clientSecret);

        const { session } = await registerStart();
        setSessionId(session);

        await registerTerms(session);
        await registerCaptcha(sessionId, captchaValue);
        const { sid } = await requestEmailToken(email, clientSecret);
        setSid(sid);
        setRegStage("email");
      }
    }
  };

  const validateEmail = async () => {
    setRegStage("email-waiting");

    const userInfo = await registerEmail(
      sessionId,
      clientSecret,
      sid,
      userName
    );

    console.log(userInfo);
    if (!userInfo.error) {
      console.log(userInfo);

      if (localStorage.getItem("userInfo"))
        localStorage.setItem("userInfo-" + userName, JSON.stringify(userInfo));
      else localStorage.setItem("userInfo", JSON.stringify(userInfo));

      window.location = "..";
    } else {
      setError(userInfo.errcode + ":" + userInfo.error);
      setRegStage("error");
    }
  };

  let regDisplay = <Loading />;

  if (regStage.slice(0, 8) === "username")
    regDisplay = (
      <div className="registration-container">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="username"
          className="input bottom-gap"
        ></input>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email address"
          className="input bottom-gap"
        ></input>
        <div className="captcha-container">
          <ReCAPTCHA
            sitekey="6LcgI54UAAAAABGdGmruw6DdOocFpYVdjYBRe4zb"
            onChange={(value) => setCaptchaValue(value)}
          />
        </div>
        <div className="agree-container">
          <input
            type="checkbox"
            name="terms"
            value={agree}
            onChange={() => {
              setAgree(!agree);
            }}
          ></input>
          <label>
            I agree to{" "}
            <a href="https://matrix-client.matrix.org/_matrix/consent?v=1.0">
              the terms
            </a>
          </label>
        </div>
        {regStage === "username" ? (
          <p
            onClick={register}
            className={
              userName && email && captchaValue && agree
                ? "registration-button"
                : "registration-button inactive"
            }
          >
            Next
          </p>
        ) : (
          <Loading />
        )}
        <p>{error}</p>
      </div>
    );

  if (regStage === "email")
    regDisplay = (
      <>
        <div className="agree-container">
          <input
            type="checkbox"
            name="terms"
            value={emailVerified}
            onChange={() => {
              setEmailVerified(!emailVerified);
            }}
          ></input>
          <label>I have verified my email</label>
        </div>
        <p
          onClick={validateEmail}
          className={
            emailVerified
              ? "registration-button"
              : "registration-button inactive"
          }
        >
          Next
        </p>
      </>
    );

  if (regStage === "email-waiting")
    regDisplay = (
      <>
        <div className="agree-container short">
          <input
            type="checkbox"
            name="terms"
            value={emailVerified}
            onChange={() => {
              setEmailVerified(!emailVerified);
            }}
          ></input>
          <label>I have verified my email</label>
        </div>
        <Loading />
      </>
    );

  if (regStage === "error")
    regDisplay = (
      <>
        <p>{error}</p>
        <p>This is most likely due to an email error.</p>
        <a href="..">Restart registration</a>
      </>
    );

  return (
    <div className="App">
      <h1>Wobbly | Registration</h1>
      <p className="note">
        Wobbly uses the matrix.org homeserver for all accounts. Some notes:
      </p>
      <ul className="list">
        <li>
          For email, please use gmail, hotmail etc - matrix.org doesn't seem to
          like rare email addresses
        </li>
        <li>After you click next, you should get a verification email</li>
        <li>After verifying, come back here to complete registration</li>
      </ul>
      {regDisplay}
    </div>
  );
};

export default Registration;
