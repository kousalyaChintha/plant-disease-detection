import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./CodeGenerator.css";
import Voice from "./Voice";
import Button from '@mui/material/Button';
import CampaignIcon from '@mui/icons-material/Campaign';


function CodeGenerator(props) { 
    const [ans, setAns] = useState(["Generating....."]);
    const [res, setRes] = useState(""); // Holds the generated text
    const [speakText, setSpeakText] = useState(""); // Holds the text to be spoken when 'Speak' is clicked

    const genAI = new GoogleGenerativeAI("AIzaSyB0tK0z4R9flcNHzEyuA53qxXqx4K2sFs8");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await model.generateContent(props.problem + " how to cure this disease in short");
                const response = await result.response;
                const text = await response.text();
                const lines = text.split("\n");

                console.log(lines);
                setRes(text);
                setAns(lines);

                if (typeof props.onGenerate === "function") { 
                    props.onGenerate(text); 
                } else {
                    console.error("props.onGenerate is not a function");
                }
            } catch (error) {
                console.error("Error:", error);
                setAns(["Error generating content"]);
            }
        }

        if (props.problem) { 
            fetchData();
        }
    }, [props.problem]); // Trigger only when props.problem changes

    const handleClick = () => {
        setSpeakText(res); // Set the generated content to be spoken
    };

    return (
        <div className="result">
            <div className="spk-container">
                <Button 
                    id="spk"
                    variant="contained" 
                    color="success" 
                    onClick={handleClick}
                >
                    Speak &nbsp; <CampaignIcon />
                </Button>
            </div>
            <ul type="none">
                {ans.map((item, index) => (
                    <li className="it" key={index}>{item}</li>
                ))}
            </ul>

            {/* Pass the speakText to Voice component */}
            {speakText && <Voice text={speakText} />}
        </div>
    );
}

export default CodeGenerator;
