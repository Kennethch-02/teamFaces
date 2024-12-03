export const Input = ({ label, id, className = "", ...props }) => {
    return (
      <div className={className}>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
        <input
          id={id}
          className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          {...props}
        />
      </div>
    );
  };