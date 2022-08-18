import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";

import Form from "@rjsf/core";


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
  const [formData, setFormData] = useState([]);
  const [id, setId] = useState("");



  let searchuder = async (res) => {   
    res.preventDefault();
    const getVoter = await axios.get(`http://localhost:8888/election/${id}`);

    console.log('get pasuxi:', getVoter.data)
    setFormData(getVoter.data);
    setId("")
  }

  let sendElectionData = async (res) => {
    const electionData = await axios.post("http://localhost:8888/election", res.formData);
    const data = electionData.data
    console.log("post pasuxi:", data); 
  }


  return (
    <div className="App">
      
      <form onSubmit={searchuder}>
        <input type="text" value={id} onChange={(e) => setId(e.target.value)}/>
        <input type="submit" value="search user by id" />
      </form>

      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={sendElectionData}
      />

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
