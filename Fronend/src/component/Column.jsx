import React, { useState, useCallback, useMemo, useRef } from "react";
import Card from "./Card";
import DropIndicator from "./DropIndicator";
import AddCard from "./AddCard";
import axios from "axios";

const Column = React.memo(({ title, headingColor, cards, column, setCards, teamName }) => {
  const [active, setActive] = useState(false);
  const indicatorsRef = useRef([]);
  
  // Memoize filtered cards to prevent recalculating on every render
  const filteredCards = useMemo(() => 
    cards.filter((c) => c.column === column),
    [cards, column]
  );

  // Create memoized event handlers
  const handleDragStart = useCallback((e, card) => {
    e.dataTransfer.setData("cardId", card._id);
  }, []);

  const getIndicators = useCallback(() => {
    // Cache indicators to avoid DOM queries on every drag event
    indicatorsRef.current = Array.from(document.querySelectorAll(`[data-column="${column}"]`));
    return indicatorsRef.current;
  }, [column]);

  const clearHighlights = useCallback((els) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  }, [getIndicators]);

  const getNearestIndicator = useCallback((e, indicators) => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );
    return el;
  }, []);

  const highlightIndicator = useCallback((e) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  }, [getIndicators, clearHighlights, getNearestIndicator]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    // Throttle highlight updates for better performance
    requestAnimationFrame(() => {
      highlightIndicator(e);
      setActive(true);
    });
  }, [highlightIndicator]);

  const handleDragLeave = useCallback(() => {
    clearHighlights();
    setActive(false);
  }, [clearHighlights]);

  const handleDragEnd = useCallback(async(e) => {
    const cardId = e.dataTransfer.getData("cardId");
    
    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    
    const before = element.dataset.before || "-1";

    // Don't proceed if trying to drop card onto itself
    if (before === cardId) return;

    // Find the card in the current array
    const cardToTransfer = cards.find((c) => c._id === cardId);
    if (!cardToTransfer) return;
    
    // Only update if the column has changed
    const needsColumnUpdate = cardToTransfer.column !== column;
    
    // Optimistic UI update
    let copy = [...cards];
    
    // Remove card from its current position
    copy = copy.filter((c) => c._id !== cardId);
    
    // Create updated card with new column
    const updatedCard = { ...cardToTransfer, column };
    
    // Determine insert position
    const moveToBack = before === "-1";
    if (moveToBack) {
      copy.push(updatedCard);
    } else {
      const insertAtIndex = copy.findIndex((el) => el._id === before);
      if (insertAtIndex === -1) return;
      copy.splice(insertAtIndex, 0, updatedCard);
    }
    
    // Update UI immediately (optimistic update)
    setCards(copy);
    
    // Then make API call if needed
    if (needsColumnUpdate) {
      try {
        await axios.patch(`https://kanban-8ds7.onrender.com/${cardToTransfer._id}`, {
          column: column,
        });
      } catch (err) {
        console.error("Failed to update card status:", err);
        // Revert on error
        setCards(cards);
      }
    }
  }, [cards, column, clearHighlights, getIndicators, getNearestIndicator, setCards]);

  return (
    <div className="w-full md:w-64 lg:w-56 shrink-0 mb-6 md:mb-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor} text-sm md:text-base truncate`}>
          {title}{teamName ? ` - ${teamName}` : ''}
        </h3>
        <span className="rounded text-xs md:text-sm text-neutral-400 ml-1">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => (
          <Card 
            key={c._id} 
            {...c} 
            handleDragStart={handleDragStart} 
            setCards={setCards} 
          />
        ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} teamName={teamName} />
      </div>
    </div>
  );
});

export default Column;