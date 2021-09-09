import { useState } from "react";
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
  console.log(result);
  return result;
};

const Registration = ({ localStorage }) => {
  const [regStage, setRegStage] = useState("username");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState();
  const [clientSecret, setClientSecret] = useState();
  const [sid, setSid] = useState();

  const register = async () => {
    if (userName.length > 0 && email.length > 0) {
      const result = await checkAvailable(userName);
      if (!result.available) setError(result.error);
      else {
        console.log(userName + " is available");
        console.log(email);

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
        const { sid } = await requestEmailToken(email, clientSecret);
        setSid(sid);
        setError("");
        setRegStage("captcha");
      }
    }
  };

  const onCaptchaChange = async (value) => {
    await registerCaptcha(sessionId, value);

    setRegStage("email");
  };

  const validateEmail = async () => {
    const userInfo = await registerEmail(
      sessionId,
      clientSecret,
      sid,
      userName
    );

    console.log(userInfo);

    if (localStorage.getItem("userInfo"))
      localStorage.setItem("userInfo-" + userName, JSON.stringify(userInfo));
    else localStorage.setItem("userInfo", JSON.stringify(userInfo));

    setRegStage("success");
  };

  let regDisplay = <p>loading</p>;

  if (regStage === "username")
    regDisplay = (
      <>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="new username"
        ></input>
        <br />
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email address"
        ></input>
        <br />
        <input type="checkbox"></input>
        <p>I agree to the terms</p>
        <p onClick={register}>Register</p>
        <p>{error}</p>
      </>
    );

  if (regStage === "captcha")
    regDisplay = (
      <>
        <ReCAPTCHA
          sitekey="6LcgI54UAAAAABGdGmruw6DdOocFpYVdjYBRe4zb"
          onChange={onCaptchaChange}
        />
      </>
    );

  if (regStage === "email")
    regDisplay = (
      <>
        <p>you should have been sent an email with a link</p>
        <p onClick={validateEmail}>click here if you received it</p>
      </>
    );

  if (regStage === "success")
    regDisplay = (
      <>
        <p>successfully registered</p>
        <a href="..">Click here to go back to the app</a>
      </>
    );

  return (
    <div>
      <h1>Registration Time</h1>
      <ol>
        There are 3 registration steps.
        <li>Choose username and email.</li>
        <li>A captcha.</li>
        <li>Verify your email by clicking a link</li>
      </ol>
      {regDisplay}
    </div>
  );
};

export default Registration;
