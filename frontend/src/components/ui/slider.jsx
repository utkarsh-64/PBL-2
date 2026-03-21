import React, { useRef } from "react";

export default function Slider({
  defaultValue = [0],
  max = 100,
  step = 1,
  onValueChange = () => {},
}) {
  const trackRef = useRef(null);
  const [value, setValue] = React.useState(defaultValue);

  const percent = ((value[0] - 0) / (max - 0)) * 100;

  const clamp = (val) => Math.min(max, Math.max(0, val));

  const handleTrackClick = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newValue = clamp(
      Math.round(((clickX / rect.width) * max) / step) * step
    );
    setValue([newValue]);
    onValueChange([newValue]);
  };

  const handleThumbDrag = (e) => {
    e.preventDefault();
    const moveListener = (moveEvent) => {
      const rect = trackRef.current.getBoundingClientRect();
      let clientX =
        moveEvent.type === "touchmove"
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const x = clientX - rect.left;
      let newValue = clamp(Math.round(((x / rect.width) * max) / step) * step);
      setValue([newValue]);
      onValueChange([newValue]);
    };
    const upListener = () => {
      window.removeEventListener("mousemove", moveListener);
      window.removeEventListener("touchmove", moveListener);
      window.removeEventListener("mouseup", upListener);
      window.removeEventListener("touchend", upListener);
    };
    window.addEventListener("mousemove", moveListener);
    window.addEventListener("touchmove", moveListener);
    window.addEventListener("mouseup", upListener);
    window.addEventListener("touchend", upListener);
  };

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div style={{ width: "100%", padding: "16px 0" }}>
      <div
        ref={trackRef}
        style={{
          position: "relative",
          height: 6,
          background: "#eee",
          borderRadius: 3,
          cursor: "pointer",
        }}
        onClick={handleTrackClick}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${percent}%`,
            background: "#0078d4",
            borderRadius: 3,
            transition: "width 0.1s",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `calc(${percent}% - 12px)`,
            top: "50%",
            transform: "translateY(-50%)",
            width: 24,
            height: 24,
            background: "#fff",
            border: "2px solid #0078d4",
            borderRadius: "50%",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            transition: "left 0.1s",
          }}
          tabIndex={0}
          role="slider"
          aria-valuenow={value[0]}
          aria-valuemin={0}
          aria-valuemax={max}
          onMouseDown={handleThumbDrag}
          onTouchStart={handleThumbDrag}
        />
      </div>
    </div>
  );
}
