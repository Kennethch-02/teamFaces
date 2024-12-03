export const Checkbox = ({ label, id, className = "", ...props }) => {
    return (
      <label htmlFor={id} className="flex gap-4">
        <input
          type="checkbox"
          id={id}
          className="size-5 rounded-md border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-offset-gray-900"
          {...props}
        />
        <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
      </label>
    );
  };