import React, { useEffect, useState } from "react";
import axios from "axios";
import Column from "./Column";
import BurnBarrel from "./BurnBarrel";
import { jwtDecode } from "jwt-decode";

const Board = () => {
  const [cards, setCards] = useState([]);
  const [userId, setUserId] = useState(null);
  const [teamName, setTeamName] = useState("");
  
  useEffect(() => {
    // Decoding token to get userId
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id); 
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:3000/board/${userId}`) 
        .then((res) => {
          setTeamName(res.data.name);
        })
        .catch((err) => console.error("Error fetching board:", err));
    }
  }, [userId]);

  useEffect(() => {
    if (teamName) {
      console.log("Fetching cards for teamName:", teamName);
      axios
        .get(`http://localhost:3000/?teamName=${teamName}`)
        .then((res) => {
          console.log("Cards received from server:", res.data);
          setCards(res.data);
        })
        .catch((err) => console.error("Error fetching cards:", err));
    } else {
      console.log("teamName not available yet, can't fetch cards");
    }
  }, [teamName]);

  return (
    <div className="flex flex-col md:flex-row overflow-x-auto h-full w-full p-4 md:p-8 lg:p-12 gap-4 md:gap-6 lg:gap-9">
      <Column
        title="Backlog"
        column="backlog"
        headingColor="text-neutral-500"
        cards={cards}
        setCards={setCards}
        teamName={teamName}
      />
      <Column
        title="TODO"
        column="todo"
        headingColor="text-yellow-200"
        cards={cards}
        setCards={setCards}
        teamName={teamName}
      />
      <Column
        title="In progress"
        column="doing"
        headingColor="text-blue-200"
        cards={cards}
        setCards={setCards}
        teamName={teamName}
      />
      <Column
        title="Complete"
        column="done"
        headingColor="text-emerald-200"
        cards={cards}
        setCards={setCards}
        teamName={teamName}
      />
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

export default Board;