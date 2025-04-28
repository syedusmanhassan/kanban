import React, { useState } from "react";
import { motion } from "framer-motion";
import DropIndicator from "./DropIndicator";
import axios from "axios";

const Card = ({ title, _id, column, handleDragStart, setCards }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleEdit = async (e) => {
    if (!editTitle.trim()) return;

    try {
      const res = await axios.patch(`https://kanban-8ds7.onrender.com/${_id}`, {
        title: editTitle.trim(),
        column,
      });
      setCards((prevCards) =>
        prevCards.map((card) => (card._id === _id ? res.data : card))
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating card:", err);
    }
  }

  return (
    <>
      <DropIndicator beforeId={_id} column={column} />
      <motion.div
        layout
        layoutId={_id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, { title, _id, column })}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
      >
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded bg-neutral-900 p-2 text-sm text-white"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-neutral-200"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <p className="text-sm text-neutral-100">{title}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-neutral-400 text-xs ml-2 hover:text-white"
            >
              Edit
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Card;