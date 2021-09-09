import "./App.css";
import Groups from "./components/Groups";

const App = ({ client }) => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Wobbly</h1>
        <Groups client={client} />
      </header>
    </div>
  );
};

export default App;
