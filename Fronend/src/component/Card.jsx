import React, { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import DropIndicator from "./DropIndicator";
import axios from "axios";

// Using React.memo to prevent unnecessary re-renders
const Card = memo(({ title, _id, column, handleDragStart, setCards }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isDragging, setIsDragging] = useState(false);

  // Use useCallback to memoize event handlers
  const handleEdit = useCallback(async () => {
    if (!editTitle.trim()) return;

    try {
      // Optimistically update UI first
      const updatedCard = { _id, title: editTitle.trim(), column };
      setCards((prevCards) =>
        prevCards.map((card) => (card._id === _id ? updatedCard : card))
      );
      
      // Then make API call in background
      const res = await axios.patch(`https://kanban-8ds7.onrender.com/${_id}`, {
        title: editTitle.trim(),
        column,
      });
      
      // Only update if server response is different
      if (res.data && JSON.stringify(res.data) !== JSON.stringify(updatedCard)) {
        setCards((prevCards) =>
          prevCards.map((card) => (card._id === _id ? res.data : card))
        );
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating card:", err);
      // Revert to original title if API call fails
      setCards((prevCards) =>
        prevCards.map((card) => (card._id === _id ? { ...card, title } : card))
      );
      setIsEditing(false);
    }
  }, [_id, column, editTitle, setCards, title]);

  // Custom drag handlers with useCallback
  const onDragStartHandler = useCallback((e) => {
    setIsDragging(true);
    handleDragStart(e, { title, _id, column });
  }, [handleDragStart, title, _id, column]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const cancelEditing = useCallback(() => setIsEditing(false), []);
  const startEditing = useCallback(() => setIsEditing(true), []);
  const handleTitleChange = useCallback((e) => setEditTitle(e.target.value), []);

  // Optimize motion component props
  const motionProps = {
    layout: !isDragging, // Disable layout animation during drag
    layoutId: _id,
    draggable: !isEditing,
    onDragStart: onDragStartHandler,
    onDragEnd: onDragEnd,
    // Optimize animation settings
    transition: {
      type: "tween", // Use tween instead of spring for better performance
      duration: 0.1,   // Shorter duration
    },
    className: "cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
  };

  return (
    <>
      <DropIndicator beforeId={_id} column={column} />
      <motion.div {...motionProps}>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editTitle}
              onChange={handleTitleChange}
              className="w-full rounded bg-neutral-900 p-2 text-sm text-white"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEditing}
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
              onClick={startEditing}
              className="text-neutral-400 text-xs ml-2 hover:text-white"
            >
              Edit
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
});

export default Card;