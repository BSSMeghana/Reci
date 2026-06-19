import React from "react";
import styles from "./BubbleText.module.css";

const BubbleText = () => {
  return (
    <div className="grid h-screen place-content-center bg-black">
      <h2 className={`${styles.bubbleWrapper} text-5xl font-thin`}>
        {"Recipe. Recommend. Eat".split("").map((char, index) => (
          <span key={index} className={styles.hoverText}>
            {char}
          </span>
        ))}
      </h2>
    </div>
  );
};

export default BubbleText;
