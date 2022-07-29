import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";

import Form from "@rjsf/core";
import ReactMarkdown from "react-markdown";


const schema = {
  title: "Girchi Election",
  description: "Fill  name and gade for vote gircho candidates",
  type: "object",
  required: ["voter", "weight", "order"],
  properties: {
    voter: {
      type: "string",
      title: "Name",
    },
    weight: {
      type: "number",
      title: "Weight",
    },
    order: {
      type: "array",
      title: "Candidates order",
      minItems: 1,
      items: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            candidate: {
              type: "string",
              title: "Candidate",
            },
            percent: {
              type: "number",
              title: "Percent",
              minimum: 0,
              maximum: 100,
            },
          },
        },
      },
    },
  },
};

const uiSchema = {
  classNames: "VoterArray",
  "ui:options": {
    orderable: false,
  },
  items: {
    classNames: "Voters",
    order: {
      items: {
        "ui:options": {
          orderable: false,
        },
        items: {
          candidate: {
            classNames: "Candidate",
          },
          percent: {
            classNames: "CandidatePercent",
          },
        },
      },
    },
  },
};

function App() {
  const [result, setResult] = useState("");
  const [formData, setFormData] = useState([]);
  useEffect(() => {
    const jsonStr = localStorage.getItem("electionInput");
    if (jsonStr == null) return;
    setFormData(JSON.parse(jsonStr));
  }, []);


  let sendElectionData = async (res:any) => {
    setFormData(res.formData);
    localStorage.setItem("electionInput", JSON.stringify(res.formData));
    console.log('dasabmitebuli', res.formData);
    const electionData = await axios.post("http://localhost:8888/election", res.formData);
    const data = electionData.data
    console.log("pasuxi:", data); 
  }

  return (
    <div className="App">
      <Form
        schema={schema as any}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={sendElectionData}
      />
      <ReactMarkdown source={result} />
    </div>
  );
}
export default App;

// solve([
//   {
//     voter: "Alisa",
//     order: [
//       //
//       // ["I"],
//       ["A", "B"],
//       ["A", "B"],
//       ["C"],
//     ],
//     weight: 100,
//   },
//   {
//     voter: "Bob",
//     order: [
//       //
//       // ["I"],
//       ["A"],
//       ["B", "C"],
//       ["Z"],
//     ],
//     weight: 10,
//   },
//   {
//     voter: "John",
//     order: [
//       //
//       // ["I"],
//       ["C"],
//       ["B", "K"],
//       ["A", "Y"],
//     ],
//     weight: 70,
//   },
// ]);
