
const Loader = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center"
      aria-label="Loading..."
      role="alert"
      aria-busy="true"
    >
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
    </div>
  );
};

export default Loader;