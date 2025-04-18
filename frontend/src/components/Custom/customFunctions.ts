export const formatTime12Hour = (timeStr) => {
  const [hour, minute] = timeStr?.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatCustomTime12Hour = (dateOfTime) => {
  console.log(dateOfTime);
  const date = new Date();
  date.setHours(Number(dateOfTime?.hour), Number(dateOfTime?.minute));
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
