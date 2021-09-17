import "./App.css";
import Groups from "./components/Groups";

const App = ({ client }) => {
  return (
    <div className="App">
      <h1>Wobbly</h1>
      <Groups client={client} />
    </div>
  );
};

export default App;
