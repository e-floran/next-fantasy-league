"use client";
import { ReactElement } from "react";
import { CSSProperties } from "react";
import { createStyles } from "../utils/style";
import rulesText from "../assets/rules/rulesText.json";

export default function LeagueRules(): ReactElement {
  const styles = createStyles<CSSProperties>()({
    rulesSection: {
      width: "100%",
    },
    rulesText: {
      width: "100%",
      textAlign: "justify",
      marginBottom: "0.25rem",
    },
  });

  const renderParagraphs = (paragraphs: string[]) => {
    return paragraphs.map((paragraph, index) => {
      return (
        <p style={styles.rulesText} key={index}>
          {paragraph}
        </p>
      );
    });
  };

  const renderSection = () => {
    return rulesText.map((section, index) => {
      return (
        <section style={styles.rulesSection} key={index}>
          <h2>{section.title}</h2>
          {renderParagraphs(section.paragraphs)}
        </section>
      );
    });
  };

  return <main>{renderSection()}</main>;
}
