import { useState } from "react";
import axios from "axios";

const Test = () => {
  const [name, setName] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/test", { name });
      setResponse(res.data.message);
    } catch (error) {
      console.error(error);
      setResponse("Error submitting data");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Test MongoDB POST</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
      {response && <p className="mt-4 text-green-600">{response}</p>}
    </div>
  );
};

export default Test;
