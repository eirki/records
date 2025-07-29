export default function Button({
  title,
  path,
  onClick,
  disabled = false,
}: {
  title: string;
  path: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "transparent",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        opacity: 0.85,
        transition: disabled
          ? "none"
          : "opacity 0.2s ease, background 0.3s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.85";
        e.currentTarget.style.transform = "scale(1)";
      }}
      title={title}
    >
      <img
        src={path}
        alt="icon"
        style={{ width: "20px", height: "20px", display: "block" }}
      />
    </button>
  );
}
