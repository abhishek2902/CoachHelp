
const TrainingCardLoaderGrid = ({n}) => {
  return (
    <div className="flex flex-wrap gap-4">
      {[...Array(n)].map((_, idx) => (
        <TrainingCardLoader key={idx} />
      ))}
    </div>
  );
};

export default TrainingCardLoaderGrid;

const TrainingCardLoader = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full sm:w-[48%] lg:w-[31%] flex flex-col justify-between animate-pulse">
      {/* Status + Code row */}
      <div className="flex justify-between items-center mb-2">
        <div className="bg-gray-200 h-3 w-12 rounded-sm" />
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 h-3 w-16 rounded-sm" />
          <div className="bg-gray-300 h-3 w-3 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <div className="h-4 bg-gray-200 rounded-sm w-2/3 mb-2" />

      {/* Description */}
      <div className="space-y-1 mb-4">
        <div className="h-3 bg-gray-200 rounded-sm w-full" />
        <div className="h-3 bg-gray-200 rounded-sm w-[90%]" />
        <div className="h-3 bg-gray-200 rounded-sm w-[75%]" />
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-auto">
        <div className="h-7 bg-gray-300 rounded-md w-16" />
        <div className="flex gap-2">
          <div className="h-7 bg-gray-300 rounded-md w-14" />
          <div className="h-7 bg-gray-300 rounded-md w-20" />
        </div>
      </div>
    </div>
  );
};
