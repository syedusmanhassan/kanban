import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import axios from "axios";

const AddCard = ({ column, setCards, teamName }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim().length) return;
    
    // Create a temporary card with a temporary ID
    const tempCard = {
      _id: `temp-${Date.now()}`, // Temporary ID
      title: text.trim(),
      column,
      teamName,
      isTemporary: true // Flag to identify temporary cards
    };
    
    // Add card to UI immediately
    setCards((prev) => [...prev, tempCard]);
    
    // Reset form
    setText("");
    setAdding(false);
    setIsSubmitting(true);
    
    try {
      // Make API call to persist card
      const res = await axios.post("https://kanban-8ds7.onrender.com/", {
        title: text.trim(),
        column,
        teamName
      });
      
      // Replace temporary card with actual card from server
      setCards((prev) => 
        prev.map(card => 
          card._id === tempCard._id ? res.data : card
        )
      );
      
      console.log("Card added successfully:", res.data);
    } catch (err) {
      console.error("Error adding card:", err);
      
      // Remove temporary card if API call fails
      setCards((prev) => 
        prev.filter(card => card._id !== tempCard._id)
      );
      
      // Optional: Show an error message to the user
      alert("Failed to add card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
            disabled={isSubmitting}
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
              disabled={isSubmitting}
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Adding..." : "Add"}</span>
              {!isSubmitting && <FiPlus />}
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

export default AddCard;