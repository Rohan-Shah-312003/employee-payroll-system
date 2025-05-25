export const ErrorAlert = ({ error, onDismiss }) => (
  error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="text-red-600 font-medium">Database Error</div>
      </div>
      <div className="text-red-700 text-sm mt-1">{error}</div>
      <button 
        onClick={onDismiss}
        className="text-red-600 text-sm underline mt-2"
      >
        Dismiss
      </button>
    </div>
  )
);
