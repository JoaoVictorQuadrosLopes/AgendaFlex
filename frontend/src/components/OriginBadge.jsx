import React from "react";

const labels = {
  MANUAL: "Manual",
  ONLINE: "Online",
  WHATSAPP: "WhatsApp"
};

export default function OriginBadge({ origem }) {
  const value = origem || "MANUAL";
  return <span className={`origin-badge origin-${value}`}>{labels[value] || value}</span>;
}
